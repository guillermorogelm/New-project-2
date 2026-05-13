import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  emptyTranscriptState,
  transcriptEventReducer,
  type RealtimeTranscriptEvent,
  type TranscriptState
} from "./transcriptEvents";

export type RealtimeStatus = "idle" | "connecting" | "listening" | "error";

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
  const statusRef = useRef<RealtimeStatus>("idle");
  const playTranslatedAudioRef = useRef(playTranslatedAudio);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    playTranslatedAudioRef.current = playTranslatedAudio;
    if (audioElementRef.current) {
      audioElementRef.current.muted = !playTranslatedAudio;
    }
  }, [playTranslatedAudio]);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    startedAtRef.current = Date.now();
    setDurationSeconds(0);
    timerRef.current = window.setInterval(() => {
      if (startedAtRef.current) {
        setDurationSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
  }, [stopTimer]);

  const closeRealtimeResources = useCallback(() => {
    stopTimer();

    dataChannelRef.current?.close();
    dataChannelRef.current = null;

    peerConnectionRef.current?.getSenders().forEach((sender) => {
      sender.track?.stop();
    });
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    mediaStreamRef.current = null;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current.muted = true;
    }
  }, [stopTimer]);

  const stop = useCallback(() => {
    closeRealtimeResources();
    setStatus("idle");
  }, [closeRealtimeResources]);

  const clear = useCallback(() => {
    setError(null);
    if (statusRef.current === "listening") {
      startedAtRef.current = Date.now();
    }
    setDurationSeconds(0);
    dispatchTranscriptEvent({ type: "reset" });
  }, []);

  const start = useCallback(
    async (targetLanguage = "es") => {
      if (statusRef.current === "connecting" || statusRef.current === "listening") {
        return;
      }

      setStatus("connecting");
      setError(null);

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
        setStatus("listening");
      } catch (caughtError) {
        closeRealtimeResources();
        setStatus("error");
        setError(toUserFacingError(caughtError));
      }
    },
    [closeRealtimeResources, startTimer]
  );

  useEffect(() => {
    return () => {
      closeRealtimeResources();
    };
  }, [closeRealtimeResources]);

  return {
    status,
    sourceTranscript: transcripts.sourceTranscript,
    translatedTranscript: transcripts.translatedTranscript,
    error,
    durationSeconds,
    audioElementRef,
    start,
    stop,
    clear
  };
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
