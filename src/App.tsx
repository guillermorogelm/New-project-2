import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
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

type TranscriptVisibility = "both" | "english-hidden" | "spanish-hidden";

function App() {
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [playTranslatedAudio, setPlayTranslatedAudio] = useState(false);
  const [highlightMedicalTerms, setHighlightMedicalTerms] = useState(true);
  const [transcriptVisibility, setTranscriptVisibility] =
    useState<TranscriptVisibility>("both");
  const [showLowerRegisterHelper, setShowLowerRegisterHelper] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedPracticeSession[]>(() =>
    getSavedSessions()
  );
  const [notice, setNotice] = useState<string | null>(null);

  const realtime = useRealtimeTranslation({ playTranslatedAudio });
  const combinedTranscript = `${realtime.sourceTranscript} ${realtime.translatedTranscript}`;
  const detectedTerms = useMemo(
    () => detectGlossaryTerms(combinedTranscript),
    [combinedTranscript]
  );
  const hasTranscript =
    Boolean(realtime.sourceTranscript.trim()) || Boolean(realtime.translatedTranscript.trim());

  const copyTranscript = async () => {
    const text = [
      "CMIT Live Interpreter Trainer",
      "",
      "English Transcript:",
      realtime.sourceTranscript || "(empty)",
      "",
      "Spanish Translation:",
      realtime.translatedTranscript || "(empty)"
    ].join("\n");

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
      sourceTranscript: realtime.sourceTranscript,
      translatedTranscript: realtime.translatedTranscript,
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

  const flashNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f7faf9] text-stone-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Header status={realtime.status} durationSeconds={realtime.durationSeconds} />
        <Disclaimer />

        {realtime.error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-rose-700" aria-hidden="true" />
            <p>{realtime.error}</p>
          </div>
        ) : null}

        {notice ? (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"
          >
            {notice}
          </div>
        ) : null}

        <ControlPanel
          status={realtime.status}
          targetLanguage={targetLanguage}
          hasTranscript={hasTranscript}
          playTranslatedAudio={playTranslatedAudio}
          highlightMedicalTerms={highlightMedicalTerms}
          onTargetLanguageChange={setTargetLanguage}
          onStart={() => void realtime.start(targetLanguage)}
          onStop={realtime.stop}
          onClear={clearSession}
          onCopy={() => void copyTranscript()}
          onSave={saveCurrentSession}
          onPlayTranslatedAudioChange={setPlayTranslatedAudio}
          onHighlightMedicalTermsChange={setHighlightMedicalTerms}
          onHideEnglish={() => setTranscriptVisibility("english-hidden")}
          onHideSpanish={() => setTranscriptVisibility("spanish-hidden")}
          onShowBoth={() => setTranscriptVisibility("both")}
          onToggleLowerRegisterHelper={() => setShowLowerRegisterHelper((value) => !value)}
        />

        <audio
          ref={realtime.audioElementRef}
          muted={!playTranslatedAudio}
          autoPlay
          playsInline
          className="sr-only"
          aria-label="Translated audio output"
        />

        <main className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <TranscriptPanel
              title="English Transcript"
              label="Source"
              text={realtime.sourceTranscript}
              emptyText="Press Start Listening and allow microphone access to begin live transcription."
              hidden={transcriptVisibility === "english-hidden"}
              highlightMedicalTerms={highlightMedicalTerms}
            />
            <TranscriptPanel
              title="Spanish Translation"
              label="Target"
              text={realtime.translatedTranscript}
              emptyText="The Spanish translation will appear here with a short live delay."
              hidden={transcriptVisibility === "spanish-hidden"}
              highlightMedicalTerms={highlightMedicalTerms}
            />
          </div>

          <GlossaryPanel
            detectedTerms={detectedTerms}
            showLowerRegisterHelper={showLowerRegisterHelper}
          />
        </main>

        <SavedSessionsPanel sessions={savedSessions} onDelete={deleteSavedSession} />
      </div>
    </div>
  );
}

export default App;
