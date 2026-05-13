import {
  ClipboardCopy,
  Eraser,
  Eye,
  EyeOff,
  Languages,
  Mic,
  Save,
  Square,
  Volume2
} from "lucide-react";
import type { ReactNode } from "react";
import type { RealtimeStatus } from "../hooks/useRealtimeTranslation";

type ControlPanelProps = {
  status: RealtimeStatus;
  targetLanguage: string;
  hasTranscript: boolean;
  playTranslatedAudio: boolean;
  highlightMedicalTerms: boolean;
  onTargetLanguageChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onCopy: () => void;
  onSave: () => void;
  onPlayTranslatedAudioChange: (value: boolean) => void;
  onHighlightMedicalTermsChange: (value: boolean) => void;
  onHideEnglish: () => void;
  onHideSpanish: () => void;
  onShowBoth: () => void;
  onToggleLowerRegisterHelper: () => void;
};

const TARGET_LANGUAGES = [
  { value: "es", label: "Spanish" }
];

export function ControlPanel({
  status,
  targetLanguage,
  hasTranscript,
  playTranslatedAudio,
  highlightMedicalTerms,
  onTargetLanguageChange,
  onStart,
  onStop,
  onClear,
  onCopy,
  onSave,
  onPlayTranslatedAudioChange,
  onHighlightMedicalTermsChange,
  onHideEnglish,
  onHideSpanish,
  onShowBoth,
  onToggleLowerRegisterHelper
}: ControlPanelProps) {
  const sessionActive = status === "connecting" || status === "listening";
  const startDisabled = sessionActive;

  return (
    <section className="sticky bottom-0 z-20 -mx-4 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur md:static md:mx-0 md:rounded-lg md:border md:px-4 md:shadow-soft">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStart}
            disabled={startDisabled}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300 sm:flex-none"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Start Listening
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={!sessionActive}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-400"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            Stop
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            Clear Session
          </button>
          <button
            type="button"
            onClick={onCopy}
            disabled={!hasTranscript}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-400"
          >
            <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
            Copy Transcript
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!hasTranscript}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-50 disabled:text-stone-400"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Practice Session
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800">
            <Languages className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <span className="sr-only">Target language</span>
            <select
              value={targetLanguage}
              onChange={(event) => onTargetLanguageChange(event.target.value)}
              disabled={sessionActive}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:text-stone-400"
            >
              {TARGET_LANGUAGES.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Toggle
              icon={<Volume2 className="h-4 w-4" aria-hidden="true" />}
              label="Play translated audio"
              checked={playTranslatedAudio}
              onChange={onPlayTranslatedAudioChange}
            />
            <Toggle
              icon={<Eye className="h-4 w-4" aria-hidden="true" />}
              label="Highlight medical terms"
              checked={highlightMedicalTerms}
              onChange={onHighlightMedicalTermsChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
        <PracticeButton icon={<EyeOff className="h-4 w-4" />} label="Hide English" onClick={onHideEnglish} />
        <PracticeButton icon={<EyeOff className="h-4 w-4" />} label="Hide Spanish" onClick={onHideSpanish} />
        <PracticeButton icon={<Eye className="h-4 w-4" />} label="Show Both" onClick={onShowBoth} />
        <PracticeButton label="Lower Register Helper" onClick={onToggleLowerRegisterHelper} />
      </div>
    </section>
  );
}

function Toggle({
  icon,
  label,
  checked,
  onChange
}: {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800">
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-emerald-700">{icon}</span>
        <span className="break-words">{label}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-emerald-700"
      />
    </label>
  );
}

function PracticeButton({
  icon,
  label,
  onClick
}: {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
    >
      {icon}
      {label}
    </button>
  );
}
