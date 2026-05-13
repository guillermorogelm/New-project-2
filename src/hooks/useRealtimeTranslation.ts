import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  emptyTranscriptState,
  transcriptEventReducer,
  type RealtimeTranscriptEvent,
  type TranscriptState
} from "./transcriptEvents";
import { detectEnglishOrSpanish } from "../utils/languageDetection";
import {
  getModeTargetLanguage,
  getSwitchedMode,
  mapDetectedLanguageToOutputLanguage,
  TRANSLATION_MODES,
  type DetectedLanguage,
  type OutputLanguage,
  type TranslationMode
} from "../utils/translationModes";
import {
  createCostReminderMessage,
  estimateRealtimeCost,
  getCostAlertInterval,
  shouldShowCostAlert
} from "../utils/realtimeCost";
import { registerSessionLifecycleHandlers } from "../utils/sessionLifecycle";
import {
  calculateRms,
  getSilenceCountdownSeconds,
  SILENCE_AUTO_STOP_SECONDS,
  SILENCE_RMS_THRESHOLD
} from "../utils/voiceActivity";

export type RealtimeStatus = "idle" | "connecting" | "listening" | "error";
export type ListeningMode = "continuous" | "hold";

type UseRealtimeTranslationOptions = {
  playTranslatedAudio: boolean;
};

type ClientSecretResponse = {
  value?: unknown;
  client_secret?: unknown;
};

export function useRealtimeTranslation({ playTranslatedAudio }: UseRealtimeTranslationOptions) {
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [listeningMode, setListeningModeState] = useState<ListeningMode>("continuous");
  const [isHolding, setIsHolding] = useState(false);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [silenceSeconds, setSilenceSeconds] = useState(0);
  const [autoStopCountdownSeconds, setAutoStopCountdownSeconds] = useState(
    SILENCE_AUTO_STOP_SECONDS
  );
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [translationMode, setTranslationModeState] = useState<TranslationMode>("en_to_es");
  const [activeTargetLanguage, setActiveTargetLanguage] = useState<OutputLanguage>("es");
  const [detectedSourceLanguage, setDetectedSourceLanguage] =
    useState<DetectedLanguage>("unknown");
  const [transcripts, dispatchTranscriptEvent] = useReducer(
    transcriptEventReducer,
    emptyTranscriptState
  );

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const activeAccumulatedSecondsRef = useRef(0);
  const lastAlertedCostIntervalRef = useRef(0);
  const statusRef = useRef<RealtimeStatus>("idle");
  const playTranslatedAudioRef = useRef(playTranslatedAudio);
  const listeningModeRef = useRef<ListeningMode>("continuous");
  const isHoldingRef = useRef(false);
  const translationModeRef = useRef<TranslationMode>("en_to_es");
  const activeTargetLanguageRef = useRef<OutputLanguage>("es");
  const autoDebounceRef = useRef<number | null>(null);
  const lastAutoSwitchAtRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const voiceActivityFrameRef = useRef<number | null>(null);
  const silenceStartedAtRef = useRef<number | null>(null);
  const lastSilenceSecondRef = useRef(-1);
  const stopRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    listeningModeRef.current = listeningMode;
  }, [listeningMode]);

  useEffect(() => {
    playTranslatedAudioRef.current = playTranslatedAudio;
    if (audioElementRef.current) {
      audioElementRef.current.muted = !playTranslatedAudio;
    }
  }, [playTranslatedAudio]);

  const updateOutputLanguage = useCallback((language: OutputLanguage) => {
    return sendOutputLanguageUpdate(dataChannelRef.current, language);
  }, []);

  const applyOutputLanguage = useCallback(
    (language: OutputLanguage) => {
      activeTargetLanguageRef.current = language;
      setActiveTargetLanguage(language);

      if (statusRef.current === "listening") {
        updateOutputLanguage(language);
      }
    },
    [updateOutputLanguage]
  );

  const addDirectionMarker = useCallback((mode: TranslationMode) => {
    const marker = `\n\n--- Direction switched to ${TRANSLATION_MODES[mode].label} ---\n\n`;
    dispatchTranscriptEvent({ type: "direction.marker", delta: marker });
  }, []);

  const setTranslationMode = useCallback(
    (mode: TranslationMode, options: { addMarker?: boolean } = {}) => {
      translationModeRef.current = mode;
      setTranslationModeState(mode);
      setDetectedSourceLanguage("unknown");
      applyOutputLanguage(getModeTargetLanguage(mode));

      if (options.addMarker) {
        addDirectionMarker(mode);
      }
    },
    [addDirectionMarker, applyOutputLanguage]
  );

  const switchDirection = useCallback(() => {
    const nextMode = getSwitchedMode(translationModeRef.current);
    setTranslationMode(nextMode, { addMarker: true });
  }, [setTranslationMode]);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      if (startedAtRef.current) {
        activeAccumulatedSecondsRef.current += Math.floor(
          (Date.now() - startedAtRef.current) / 1000
        );
        setDurationSeconds(activeAccumulatedSecondsRef.current);
      }
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startedAtRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startedAtRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      if (startedAtRef.current) {
        const activeSeconds =
          activeAccumulatedSecondsRef.current +
          Math.floor((Date.now() - startedAtRef.current) / 1000);
        setDurationSeconds(activeSeconds);

        if (shouldShowCostAlert(activeSeconds, lastAlertedCostIntervalRef.current)) {
          lastAlertedCostIntervalRef.current = getCostAlertInterval(activeSeconds);
          setSessionNotice(createCostReminderMessage(activeSeconds));
        }
      }
    }, 1000);
  }, [stopTimer]);

  const stopVoiceActivityMonitor = useCallback(() => {
    if (voiceActivityFrameRef.current !== null) {
      window.cancelAnimationFrame(voiceActivityFrameRef.current);
      voiceActivityFrameRef.current = null;
    }

    analyserRef.current = null;
    silenceStartedAtRef.current = null;
    lastSilenceSecondRef.current = -1;
    setIsVoiceDetected(false);
    setSilenceSeconds(0);
    setAutoStopCountdownSeconds(SILENCE_AUTO_STOP_SECONDS);

    const audioContext = audioContextRef.current;
    audioContextRef.current = null;

    if (audioContext && audioContext.state !== "closed") {
      void audioContext
        .close()
        .then(() => debugLog("AudioContext closed"))
        .catch(() => undefined);
    }
  }, []);

  const closeRealtimeResources = useCallback(() => {
    debugLog("Stopping realtime session");
    stopTimer();
    stopVoiceActivityMonitor();

    try {
      dataChannelRef.current?.close();
    } catch {
      // Close is best-effort; resources may already be closing.
    }
    dataChannelRef.current = null;

    try {
      peerConnectionRef.current?.getSenders().forEach((sender) => {
        sender.track?.stop();
      });
      peerConnectionRef.current?.close();
      debugLog("Peer connection closed");
    } catch {
      // Peer connection cleanup should be idempotent.
    }
    peerConnectionRef.current = null;

    try {
      mediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
      debugLog("Microphone tracks stopped");
    } catch {
      // Media tracks may already be stopped.
    }
    mediaStreamRef.current = null;

    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
      } catch {
        // jsdom and some browsers can throw here during teardown.
      }
      audioElementRef.current.srcObject = null;
      audioElementRef.current.muted = true;
    }
  }, [stopTimer, stopVoiceActivityMonitor]);

  const stop = useCallback(() => {
    closeRealtimeResources();
    isHoldingRef.current = false;
    setIsHolding(false);
    setIsVoiceDetected(false);
    setSilenceSeconds(0);
    setAutoStopCountdownSeconds(SILENCE_AUTO_STOP_SECONDS);
    statusRef.current = "idle";
    setStatus("idle");
  }, [closeRealtimeResources]);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  const clear = useCallback(() => {
    setError(null);
    if (statusRef.current === "listening") {
      startedAtRef.current = Date.now();
    }
    activeAccumulatedSecondsRef.current = 0;
    lastAlertedCostIntervalRef.current = 0;
    setDurationSeconds(0);
    setSessionNotice(null);
    dispatchTranscriptEvent({ type: "reset" });
  }, []);

  const clearSessionNotice = useCallback(() => {
    setSessionNotice(null);
  }, []);

  const startVoiceActivityMonitor = useCallback((mediaStream: MediaStream) => {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    stopVoiceActivityMonitor();

    const audioContext = new AudioContextConstructor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    audioContext.createMediaStreamSource(mediaStream).connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const samples = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (statusRef.current !== "listening" || !analyserRef.current) {
        return;
      }

      analyserRef.current.getByteTimeDomainData(samples);
      const rms = calculateRms(samples);
      const now = performance.now();

      if (rms >= SILENCE_RMS_THRESHOLD) {
        silenceStartedAtRef.current = null;
        lastSilenceSecondRef.current = -1;
        setIsVoiceDetected(true);
        setSilenceSeconds(0);
        setAutoStopCountdownSeconds(SILENCE_AUTO_STOP_SECONDS);
      } else {
        if (silenceStartedAtRef.current === null) {
          silenceStartedAtRef.current = now;
        }

        const elapsedSilenceSeconds = Math.floor((now - silenceStartedAtRef.current) / 1000);
        if (elapsedSilenceSeconds !== lastSilenceSecondRef.current) {
          lastSilenceSecondRef.current = elapsedSilenceSeconds;
          setIsVoiceDetected(false);
          setSilenceSeconds(elapsedSilenceSeconds);
          setAutoStopCountdownSeconds(getSilenceCountdownSeconds(elapsedSilenceSeconds));
        }

        if (elapsedSilenceSeconds >= SILENCE_AUTO_STOP_SECONDS) {
          setSessionNotice("Auto-stopped after 3 minutes without voice.");
          stopRef.current();
          return;
        }
      }

      voiceActivityFrameRef.current = window.requestAnimationFrame(tick);
    };

    voiceActivityFrameRef.current = window.requestAnimationFrame(tick);
  }, [stopVoiceActivityMonitor]);

  const start = useCallback(
    async () => {
      if (statusRef.current === "connecting" || statusRef.current === "listening") {
        return;
      }

      statusRef.current = "connecting";
      setStatus("connecting");
      setError(null);
      const targetLanguage = activeTargetLanguageRef.current;

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support microphone capture.");
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = mediaStream;

        const peerConnection = new RTCPeerConnection();
        peerConnectionRef.current = peerConnection;

        peerConnection.ontrack = (event) => {
          if (!audioElementRef.current) {
            return;
          }

          audioElementRef.current.srcObject = event.streams[0];
          audioElementRef.current.muted = !playTranslatedAudioRef.current;
          void audioElementRef.current.play().catch(() => undefined);
        };

        peerConnection.onconnectionstatechange = () => {
          if (peerConnection.connectionState === "failed") {
            setError("The Realtime connection failed. Please stop and try again.");
            statusRef.current = "error";
            setStatus("error");
            closeRealtimeResources();
          }
        };

        for (const track of mediaStream.getAudioTracks()) {
          peerConnection.addTrack(track, mediaStream);
        }

        const dataChannel = peerConnection.createDataChannel("oai-events");
        dataChannelRef.current = dataChannel;
        dataChannel.addEventListener("message", (message) => {
          const event = parseRealtimeEvent(message.data);
          if (event) {
            dispatchTranscriptEvent(event);
          }
        });

        const sessionResponse = await fetch("/api/realtime/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ targetLanguage })
        });

        const sessionPayload = await readJsonResponse(sessionResponse);
        if (!sessionResponse.ok) {
          throw new Error(
            extractReadableError(sessionPayload) ||
              `Session request failed with ${sessionResponse.status}.`
          );
        }

        const clientSecret = extractClientSecret(sessionPayload);
        if (!clientSecret) {
          throw new Error("The backend did not return a usable Realtime client secret.");
        }

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        if (!offer.sdp) {
          throw new Error("Unable to create a WebRTC offer.");
        }

        const sdpResponse = await fetch("https://api.openai.com/v1/realtime/translations/calls", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            "Content-Type": "application/sdp"
          },
          body: offer.sdp
        });

        if (!sdpResponse.ok) {
          const message = await sdpResponse.text();
          throw new Error(
            message || `Realtime call failed with ${sdpResponse.status} ${sdpResponse.statusText}.`
          );
        }

        const answerSdp = await sdpResponse.text();
        await peerConnection.setRemoteDescription({
          type: "answer",
          sdp: answerSdp
        });

        startTimer();
        setIsVoiceDetected(false);
        setSilenceSeconds(0);
        setAutoStopCountdownSeconds(SILENCE_AUTO_STOP_SECONDS);
        statusRef.current = "listening";
        setStatus("listening");
        startVoiceActivityMonitor(mediaStream);
      } catch (caughtError) {
        closeRealtimeResources();
        statusRef.current = "error";
        setStatus("error");
        setError(toUserFacingError(caughtError));
      }
    },
    [closeRealtimeResources, startTimer, startVoiceActivityMonitor]
  );

  const setListeningMode = useCallback(
    (mode: ListeningMode) => {
      if (mode === listeningModeRef.current) {
        return;
      }

      if (
        mode === "hold" &&
        (statusRef.current === "connecting" || statusRef.current === "listening") &&
        !isHoldingRef.current
      ) {
        stop();
      }

      if (mode === "continuous") {
        isHoldingRef.current = false;
        setIsHolding(false);
      }

      listeningModeRef.current = mode;
      setListeningModeState(mode);
    },
    [stop]
  );

  const startHolding = useCallback(async () => {
    if (isHoldingRef.current) {
      return;
    }

    isHoldingRef.current = true;
    setIsHolding(true);
    listeningModeRef.current = "hold";
    setListeningModeState("hold");

    if (statusRef.current !== "connecting" && statusRef.current !== "listening") {
      await start();
    }
  }, [start]);

  const stopHolding = useCallback(() => {
    if (!isHoldingRef.current) {
      return;
    }

    isHoldingRef.current = false;
    setIsHolding(false);
    stop();
  }, [stop]);

  useEffect(() => {
    return () => {
      closeRealtimeResources();
    };
  }, [closeRealtimeResources]);

  useEffect(() => {
    return registerSessionLifecycleHandlers({
      isSessionActive: () =>
        statusRef.current === "connecting" || statusRef.current === "listening",
      cleanupSession: () => {
        closeRealtimeResources();
        isHoldingRef.current = false;
        setIsHolding(false);
        statusRef.current = "idle";
        setStatus("idle");
      },
      onBackgroundWarning: () => {
        setSessionNotice("App is in the background. Stop listening to avoid extra API usage.");
      }
    });
  }, [closeRealtimeResources]);

  useEffect(() => {
    if (translationMode !== "auto") {
      if (autoDebounceRef.current !== null) {
        window.clearTimeout(autoDebounceRef.current);
        autoDebounceRef.current = null;
      }
      return;
    }

    if (!transcripts.sourceTranscript.trim()) {
      setDetectedSourceLanguage("unknown");
      return;
    }

    if (autoDebounceRef.current !== null) {
      window.clearTimeout(autoDebounceRef.current);
    }

    autoDebounceRef.current = window.setTimeout(() => {
      const detectedLanguage = detectEnglishOrSpanish(transcripts.sourceTranscript);
      setDetectedSourceLanguage(detectedLanguage);

      const nextOutputLanguage = mapDetectedLanguageToOutputLanguage(detectedLanguage);
      if (!nextOutputLanguage || nextOutputLanguage === activeTargetLanguageRef.current) {
        return;
      }

      const now = Date.now();
      if (now - lastAutoSwitchAtRef.current < 5000) {
        return;
      }

      lastAutoSwitchAtRef.current = now;
      applyOutputLanguage(nextOutputLanguage);
    }, 2000);

    return () => {
      if (autoDebounceRef.current !== null) {
        window.clearTimeout(autoDebounceRef.current);
        autoDebounceRef.current = null;
      }
    };
  }, [applyOutputLanguage, translationMode, transcripts.sourceTranscript]);

  return {
    status,
    listeningMode,
    isHolding,
    isVoiceDetected,
    silenceSeconds,
    autoStopCountdownSeconds,
    estimatedCost: estimateRealtimeCost(durationSeconds),
    sessionNotice,
    translationMode,
    activeTargetLanguage,
    detectedSourceLanguage,
    sourceTranscript: transcripts.sourceTranscript,
    translatedTranscript: transcripts.translatedTranscript,
    error,
    durationSeconds,
    audioElementRef,
    setTranslationMode,
    switchDirection,
    updateOutputLanguage,
    setListeningMode,
    startHolding,
    stopHolding,
    clearSessionNotice,
    start,
    stop,
    clear
  };
}

function debugLog(message: string): void {
  if (import.meta.env.DEV) {
    console.debug(message);
  }
}

export function sendOutputLanguageUpdate(
  dataChannel: Pick<RTCDataChannel, "readyState" | "send"> | null,
  language: OutputLanguage
): boolean {
  if (!dataChannel || dataChannel.readyState !== "open") {
    return false;
  }

  dataChannel.send(
    JSON.stringify({
      type: "session.update",
      session: {
        audio: {
          output: {
            language
          }
        }
      }
    })
  );

  return true;
}

export function parseRealtimeEvent(data: unknown): RealtimeTranscriptEvent | null {
  if (typeof data !== "string") {
    return null;
  }

  try {
    const event = JSON.parse(data);
    return event && typeof event === "object" ? (event as RealtimeTranscriptEvent) : null;
  } catch {
    return null;
  }
}

function extractClientSecret(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const response = payload as ClientSecretResponse;

  if (typeof response.value === "string") {
    return response.value;
  }

  if (typeof response.client_secret === "string") {
    return response.client_secret;
  }

  if (
    response.client_secret &&
    typeof response.client_secret === "object" &&
    "value" in response.client_secret &&
    typeof response.client_secret.value === "string"
  ) {
    return response.client_secret.value;
  }

  return null;
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function extractReadableError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("error" in payload) {
    const error = payload.error;

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object" && "message" in error) {
      const message = error.message;
      return typeof message === "string" ? message : null;
    }
  }

  if ("message" in payload) {
    const message = payload.message;
    return typeof message === "string" ? message : null;
  }

  return null;
}

function toUserFacingError(error: unknown): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Microphone permission was denied. Allow microphone access and try again.";
  }

  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No microphone was found on this device.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while starting the live interpreter trainer.";
}
