import { useEffect, useMemo, useState } from "react";
import { AlertCircle, PanelRightClose, PanelRightOpen } from "lucide-react";
import { ControlPanel } from "./components/ControlPanel";
import { Disclaimer } from "./components/Disclaimer";
import { GlossaryPanel } from "./components/GlossaryPanel";
import { Header } from "./components/Header";
import { SavedSessionsPanel } from "./components/SavedSessionsPanel";
import { TranscriptPanel } from "./components/TranscriptPanel";
import { useRealtimeTranslation } from "./hooks/useRealtimeTranslation";
import { detectGlossaryTerms } from "./utils/glossary";
import {
  deletePracticeSession,
  getSavedSessions,
  savePracticeSession,
  type SavedPracticeSession
} from "./utils/sessionStorage";
import { extractDirectionMarkers, stripDirectionMarkers } from "./utils/transcriptText";
import { TRANSLATION_MODES } from "./utils/translationModes";

type TranscriptVisibility = "both" | "source-hidden" | "target-hidden";
type MobileWorkspaceTab = "source" | "translation" | "helper";

function App() {
  const [playTranslatedAudio, setPlayTranslatedAudio] = useState(false);
  const [highlightMedicalTerms, setHighlightMedicalTerms] = useState(true);
  const [transcriptVisibility, setTranscriptVisibility] =
    useState<TranscriptVisibility>("both");
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<MobileWorkspaceTab>("source");
  const [helperOpen, setHelperOpen] = useState(true);
  const [showLowerRegisterHelper, setShowLowerRegisterHelper] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedPracticeSession[]>(() =>
    getSavedSessions()
  );
  const [notice, setNotice] = useState<string | null>(null);

  const realtime = useRealtimeTranslation({ playTranslatedAudio });
  const modeConfig = TRANSLATION_MODES[realtime.translationMode];
  const combinedTranscript = `${realtime.sourceTranscript} ${realtime.translatedTranscript}`;
  const detectedTerms = useMemo(
    () => detectGlossaryTerms(combinedTranscript),
    [combinedTranscript]
  );
  const hasTranscript =
    Boolean(realtime.sourceTranscript.trim()) || Boolean(realtime.translatedTranscript.trim());
  const cleanSourceTranscript = stripDirectionMarkers(realtime.sourceTranscript);
  const cleanTranslatedTranscript = stripDirectionMarkers(realtime.translatedTranscript);
  const sessionNotice = realtime.sessionNotice;
  const clearSessionNotice = realtime.clearSessionNotice;

  useEffect(() => {
    if (!sessionNotice) {
      return;
    }

    flashNotice(sessionNotice);
    clearSessionNotice();
  }, [clearSessionNotice, sessionNotice]);

  const copyTranscript = async () => {
    const directionHistory = Array.from(
      new Set([
        ...extractDirectionMarkers(realtime.sourceTranscript),
        ...extractDirectionMarkers(realtime.translatedTranscript)
      ])
    );
    const text = [
      "CMIT Live Interpreter Trainer",
      `Date: ${new Intl.DateTimeFormat(undefined, {
        dateStyle: "full",
        timeStyle: "short"
      }).format(new Date())}`,
      `Direction: ${modeConfig.label}`,
      directionHistory.length ? `Direction changes: ${directionHistory.join(" | ")}` : null,
      `Detected terms: ${detectedTerms.map((term) => term.term).join(", ") || "None"}`,
      "",
      `Source transcript (${modeConfig.sourceLabel}):`,
      cleanSourceTranscript || "(empty)",
      "",
      `Translation (${modeConfig.targetLabel}):`,
      cleanTranslatedTranscript || "(empty)"
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      flashNotice("Transcript copied.");
    } catch {
      flashNotice("Copy failed. Select the transcript text manually.");
    }
  };

  const saveCurrentSession = () => {
    if (!hasTranscript) {
      return;
    }

    const saved = savePracticeSession({
      direction: modeConfig.label,
      sourceTranscript: cleanSourceTranscript,
      translatedTranscript: cleanTranslatedTranscript,
      detectedTerms
    });
    setSavedSessions((current) => [saved, ...current]);
    flashNotice("Practice session saved locally.");
  };

  const deleteSavedSession = (id: string) => {
    deletePracticeSession(id);
    setSavedSessions((current) => current.filter((session) => session.id !== id));
  };

  const clearSession = () => {
    realtime.clear();
    flashNotice("Session text cleared.");
  };

  const switchDirection = () => {
    const nextMode = realtime.translationMode === "en_to_es" ? "es_to_en" : "en_to_es";
    realtime.switchDirection();
    flashNotice(`Direction switched to ${TRANSLATION_MODES[nextMode].label}.`);
  };

  const flashNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faf9] text-slate-950">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 pb-36 pt-0 sm:px-6 md:pb-6 lg:px-8">
        <Header
          status={realtime.status}
          durationSeconds={realtime.durationSeconds}
          estimatedCost={realtime.estimatedCost}
        />
        <Disclaimer />

        {realtime.error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-rose-700" aria-hidden="true" />
            <p>{realtime.error}</p>
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="fixed left-1/2 top-20 z-50 w-[min(calc(100vw-2rem),420px)] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-soft md:top-16"
          >
            {notice}
          </div>
        ) : null}

        <ControlPanel
          status={realtime.status}
          translationMode={realtime.translationMode}
          activeTargetLanguage={realtime.activeTargetLanguage}
          detectedSourceLanguage={realtime.detectedSourceLanguage}
          listeningMode={realtime.listeningMode}
          isHolding={realtime.isHolding}
          isVoiceDetected={realtime.isVoiceDetected}
          autoStopCountdownSeconds={realtime.autoStopCountdownSeconds}
          durationSeconds={realtime.durationSeconds}
          estimatedCost={realtime.estimatedCost}
          hasTranscript={hasTranscript}
          playTranslatedAudio={playTranslatedAudio}
          highlightMedicalTerms={highlightMedicalTerms}
          onTranslationModeChange={realtime.setTranslationMode}
          onSwitchDirection={switchDirection}
          onListeningModeChange={realtime.setListeningMode}
          onHoldStart={() => void realtime.startHolding()}
          onHoldEnd={realtime.stopHolding}
          onStart={() => void realtime.start()}
          onStop={realtime.stop}
          onClear={clearSession}
          onCopy={() => void copyTranscript()}
          onSave={saveCurrentSession}
          onPlayTranslatedAudioChange={setPlayTranslatedAudio}
          onHighlightMedicalTermsChange={setHighlightMedicalTerms}
          onHideSource={() => setTranscriptVisibility("source-hidden")}
          onHideTarget={() => setTranscriptVisibility("target-hidden")}
          onShowBoth={() => setTranscriptVisibility("both")}
          onToggleLowerRegisterHelper={() => setShowLowerRegisterHelper((value) => !value)}
        />

        <div className="flex items-center justify-between gap-3 md:hidden">
          <div className="grid flex-1 grid-cols-3 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <MobileTabButton
              label="Source"
              active={mobileWorkspaceTab === "source"}
              onClick={() => setMobileWorkspaceTab("source")}
            />
            <MobileTabButton
              label="Translation"
              active={mobileWorkspaceTab === "translation"}
              onClick={() => setMobileWorkspaceTab("translation")}
            />
            <MobileTabButton
              label="Helper"
              active={mobileWorkspaceTab === "helper"}
              onClick={() => setMobileWorkspaceTab("helper")}
            />
          </div>
        </div>

        <audio
          ref={realtime.audioElementRef}
          muted={!playTranslatedAudio}
          autoPlay
          playsInline
          className="sr-only"
          aria-label="Translated audio output"
        />

        <main
          className={`grid min-w-0 gap-4 ${
            helperOpen ? "xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]" : "xl:grid-cols-1"
          }`}
        >
          <div className="hidden min-w-0 gap-4 md:grid lg:grid-cols-2">
            <TranscriptPanel
              title={modeConfig.sourceLabel}
              label="Source"
              text={realtime.sourceTranscript}
              emptyText="Press Start Listening and allow microphone access to begin live transcription."
              directionLabel={modeConfig.label}
              isListening={realtime.status === "listening"}
              hidden={transcriptVisibility === "source-hidden"}
              highlightMedicalTerms={highlightMedicalTerms}
            />
            <TranscriptPanel
              title={modeConfig.targetLabel}
              label="Target"
              text={realtime.translatedTranscript}
              emptyText="The live translation will appear here with a short delay."
              directionLabel={modeConfig.label}
              isListening={realtime.status === "listening"}
              hidden={transcriptVisibility === "target-hidden"}
              highlightMedicalTerms={highlightMedicalTerms}
            />
          </div>

          <div className="min-w-0 md:hidden">
            {mobileWorkspaceTab === "source" ? (
              <TranscriptPanel
                title={modeConfig.sourceLabel}
                label="Source"
                text={realtime.sourceTranscript}
                emptyText="Press Start Listening and allow microphone access to begin live transcription."
                directionLabel={modeConfig.label}
                isListening={realtime.status === "listening"}
                hidden={transcriptVisibility === "source-hidden"}
                highlightMedicalTerms={highlightMedicalTerms}
              />
            ) : null}
            {mobileWorkspaceTab === "translation" ? (
              <TranscriptPanel
                title={modeConfig.targetLabel}
                label="Target"
                text={realtime.translatedTranscript}
                emptyText="The live translation will appear here with a short delay."
                directionLabel={modeConfig.label}
                isListening={realtime.status === "listening"}
                hidden={transcriptVisibility === "target-hidden"}
                highlightMedicalTerms={highlightMedicalTerms}
              />
            ) : null}
            {mobileWorkspaceTab === "helper" ? (
              <GlossaryPanel
                detectedTerms={detectedTerms}
                showLowerRegisterHelper={showLowerRegisterHelper}
              />
            ) : null}
          </div>

          <div className="hidden min-w-0 xl:block">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setHelperOpen((value) => !value)}
                className="inline-flex min-h-9 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-expanded={helperOpen}
              >
                {helperOpen ? (
                  <PanelRightClose className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
                )}
                {helperOpen ? "Hide Helper" : "Show Helper"}
              </button>
            </div>
            {helperOpen ? (
              <GlossaryPanel
                detectedTerms={detectedTerms}
                showLowerRegisterHelper={showLowerRegisterHelper}
              />
            ) : null}
          </div>
        </main>

        <SavedSessionsPanel sessions={savedSessions} onDelete={deleteSavedSession} />
      </div>
    </div>
  );
}

function MobileTabButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-xl px-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        active ? "bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-200" : "text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

export default App;
