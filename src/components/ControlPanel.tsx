import {
  ArrowLeftRight,
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
import {
  getLanguageName,
  TRANSLATION_MODES,
  type DetectedLanguage,
  type OutputLanguage,
  type TranslationMode
} from "../utils/translationModes";

type ControlPanelProps = {
  status: RealtimeStatus;
  translationMode: TranslationMode;
  activeTargetLanguage: OutputLanguage;
  detectedSourceLanguage: DetectedLanguage;
  hasTranscript: boolean;
  playTranslatedAudio: boolean;
  highlightMedicalTerms: boolean;
  onTranslationModeChange: (value: TranslationMode) => void;
  onSwitchDirection: () => void;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onCopy: () => void;
  onSave: () => void;
  onPlayTranslatedAudioChange: (value: boolean) => void;
  onHighlightMedicalTermsChange: (value: boolean) => void;
  onHideSource: () => void;
  onHideTarget: () => void;
  onShowBoth: () => void;
  onToggleLowerRegisterHelper: () => void;
};

export function ControlPanel({
  status,
  translationMode,
  activeTargetLanguage,
  detectedSourceLanguage,
  hasTranscript,
  playTranslatedAudio,
  highlightMedicalTerms,
  onTranslationModeChange,
  onSwitchDirection,
  onStart,
  onStop,
  onClear,
  onCopy,
  onSave,
  onPlayTranslatedAudioChange,
  onHighlightMedicalTermsChange,
  onHideSource,
  onHideTarget,
  onShowBoth,
  onToggleLowerRegisterHelper
}: ControlPanelProps) {
  const sessionActive = status === "connecting" || status === "listening";
  const startDisabled = sessionActive;
  const modeConfig = TRANSLATION_MODES[translationMode];
  const autoMode = translationMode === "auto";

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
          <div className="grid gap-2 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_auto] xl:col-span-1">
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800">
              <Languages className="h-4 w-4 flex-none text-emerald-700" aria-hidden="true" />
              <span className="text-stone-600">Direction</span>
              <select
                value={translationMode}
                onChange={(event) => onTranslationModeChange(event.target.value as TranslationMode)}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                aria-label="Direction"
              >
                {(Object.keys(TRANSLATION_MODES) as TranslationMode[]).map((mode) => (
                  <option key={mode} value={mode}>
                    {TRANSLATION_MODES[mode].label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={onSwitchDirection}
              disabled={status === "connecting"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-50 disabled:text-stone-400"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              Switch Direction
            </button>
          </div>

          {autoMode ? (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950 sm:col-span-2 xl:col-span-1">
              <p className="font-semibold">Auto mode is experimental. Manual direction is more reliable.</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-950 ring-1 ring-amber-200">
                  Detected: {getLanguageName(detectedSourceLanguage)}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-950 ring-1 ring-amber-200">
                  Output: {getLanguageName(activeTargetLanguage)}
                </span>
              </div>
              <p className="leading-6">
                Auto mode may switch incorrectly during short phrases or mixed speech.
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700 sm:col-span-2 xl:col-span-1">
              {modeConfig.sourceLabel} → {modeConfig.targetLabel}
            </p>
          )}

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
        <PracticeButton icon={<EyeOff className="h-4 w-4" />} label={`Hide ${getPracticeLanguageLabel(modeConfig.sourceLanguage, "Source")}`} onClick={onHideSource} />
        <PracticeButton icon={<EyeOff className="h-4 w-4" />} label={`Hide ${getPracticeLanguageLabel(modeConfig.targetLanguage, "Translation")}`} onClick={onHideTarget} />
        <PracticeButton icon={<Eye className="h-4 w-4" />} label="Show Both" onClick={onShowBoth} />
        <PracticeButton label="Lower Register Helper" onClick={onToggleLowerRegisterHelper} />
      </div>
    </section>
  );
}

function getPracticeLanguageLabel(language: OutputLanguage | "auto", fallback: string): string {
  if (language === "auto") {
    return fallback;
  }

  return getLanguageName(language);
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
