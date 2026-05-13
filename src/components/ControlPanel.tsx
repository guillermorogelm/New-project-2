import {
  ArrowLeftRight,
  ClipboardCopy,
  Eraser,
  Eye,
  EyeOff,
  Languages,
  Mic,
  MoreHorizontal,
  Save,
  Square,
  Volume2
} from "lucide-react";
import { useState, type ReactNode } from "react";
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

export function ControlPanel(props: ControlPanelProps) {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  return (
    <>
      <section className="hidden rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-soft md:block">
        <div className="flex flex-wrap items-center gap-3">
          <SessionButton status={props.status} onStart={props.onStart} onStop={props.onStop} />
          <DirectionSelector
            translationMode={props.translationMode}
            onTranslationModeChange={props.onTranslationModeChange}
          />
          <button
            type="button"
            onClick={props.onSwitchDirection}
            disabled={props.status === "connecting"}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 outline-none transition hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Switch Direction
          </button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Toggle
              icon={<Volume2 className="h-4 w-4" aria-hidden="true" />}
              label="Audio"
              checked={props.playTranslatedAudio}
              onChange={props.onPlayTranslatedAudioChange}
            />
            <Toggle
              icon={<Eye className="h-4 w-4" aria-hidden="true" />}
              label="Terms"
              checked={props.highlightMedicalTerms}
              onChange={props.onHighlightMedicalTermsChange}
            />
            <SecondaryButton icon={<Eraser className="h-4 w-4" />} label="Clear" onClick={props.onClear} />
            <SecondaryButton
              icon={<ClipboardCopy className="h-4 w-4" />}
              label="Copy"
              onClick={props.onCopy}
              disabled={!props.hasTranscript}
            />
            <SecondaryButton
              icon={<Save className="h-4 w-4" />}
              label="Save"
              onClick={props.onSave}
              disabled={!props.hasTranscript}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <PracticeModeControls
            onHideSource={props.onHideSource}
            onHideTarget={props.onHideTarget}
            onShowBoth={props.onShowBoth}
            onToggleLowerRegisterHelper={props.onToggleLowerRegisterHelper}
          />
          <ModeStatus
            translationMode={props.translationMode}
            activeTargetLanguage={props.activeTargetLanguage}
            detectedSourceLanguage={props.detectedSourceLanguage}
          />
        </div>
      </section>

      <section className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 shadow-[0_-18px_44px_rgba(15,23,42,0.16)] backdrop-blur md:hidden">
        <div className="mx-auto max-w-lg">
          {mobileMoreOpen ? (
            <div className="mb-2 rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <DirectionSelector
                translationMode={props.translationMode}
                onTranslationModeChange={props.onTranslationModeChange}
                compact
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Toggle
                  icon={<Volume2 className="h-4 w-4" aria-hidden="true" />}
                  label="Audio"
                  checked={props.playTranslatedAudio}
                  onChange={props.onPlayTranslatedAudioChange}
                />
                <Toggle
                  icon={<Eye className="h-4 w-4" aria-hidden="true" />}
                  label="Terms"
                  checked={props.highlightMedicalTerms}
                  onChange={props.onHighlightMedicalTermsChange}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <SecondaryButton icon={<Eraser className="h-4 w-4" />} label="Clear" onClick={props.onClear} />
                <SecondaryButton
                  icon={<ClipboardCopy className="h-4 w-4" />}
                  label="Copy"
                  onClick={props.onCopy}
                  disabled={!props.hasTranscript}
                />
                <SecondaryButton
                  icon={<Save className="h-4 w-4" />}
                  label="Save"
                  onClick={props.onSave}
                  disabled={!props.hasTranscript}
                />
              </div>
              <div className="mt-3">
                <PracticeModeControls
                  onHideSource={props.onHideSource}
                  onHideTarget={props.onHideTarget}
                  onShowBoth={props.onShowBoth}
                  onToggleLowerRegisterHelper={props.onToggleLowerRegisterHelper}
                  compact
                />
              </div>
              <div className="mt-3">
                <ModeStatus
                  translationMode={props.translationMode}
                  activeTargetLanguage={props.activeTargetLanguage}
                  detectedSourceLanguage={props.detectedSourceLanguage}
                />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
            <SessionButton status={props.status} onStart={props.onStart} onStop={props.onStop} mobile />
            <button
              type="button"
              onClick={props.onSwitchDirection}
              disabled={props.status === "connecting"}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-900 outline-none transition active:scale-[0.99] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
              aria-label="Switch Direction"
            >
              <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
              <span className="hidden min-[430px]:inline">Switch</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMoreOpen((value) => !value)}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-700 outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-expanded={mobileMoreOpen}
              aria-label="More controls"
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function SessionButton({
  status,
  onStart,
  onStop,
  mobile = false
}: {
  status: RealtimeStatus;
  onStart: () => void;
  onStop: () => void;
  mobile?: boolean;
}) {
  const sessionActive = status === "connecting" || status === "listening";

  if (sessionActive) {
    return (
      <button
        type="button"
        onClick={onStop}
        disabled={status === "connecting"}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white font-semibold text-rose-700 outline-none transition hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:text-slate-400 ${
          mobile ? "min-h-12 px-4 text-base" : "min-h-11 px-4 text-sm"
        }`}
      >
        <Square className="h-4 w-4" aria-hidden="true" />
        Stop
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 font-semibold text-white shadow-sm outline-none transition hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        mobile ? "min-h-12 px-4 text-base" : "min-h-11 px-5 text-sm"
      }`}
    >
      <Mic className="h-4 w-4" aria-hidden="true" />
      Start Listening
    </button>
  );
}

function DirectionSelector({
  translationMode,
  onTranslationModeChange,
  compact = false
}: {
  translationMode: TranslationMode;
  onTranslationModeChange: (value: TranslationMode) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-1 ${
        compact ? "" : "flex items-center gap-1"
      }`}
      role="radiogroup"
      aria-label="Direction"
    >
      <span className={`items-center gap-1.5 px-2 text-xs font-semibold text-slate-500 ${compact ? "mb-1 flex" : "hidden xl:flex"}`}>
        <Languages className="h-3.5 w-3.5" aria-hidden="true" />
        Direction
      </span>
      <div className={`grid gap-1 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
        {(Object.keys(TRANSLATION_MODES) as TranslationMode[]).map((mode) => {
          const active = translationMode === mode;
          const label = mode === "auto" ? "Auto" : TRANSLATION_MODES[mode].label;

          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onTranslationModeChange(mode)}
              className={`min-h-9 rounded-xl px-3 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500 sm:text-sm ${
                active
                  ? "bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-200"
                  : "text-slate-600 hover:bg-white/70"
              }`}
            >
              {label}
              {mode === "auto" ? <span className="sr-only"> Detect, experimental</span> : null}
            </button>
          );
        })}
      </div>
    </div>
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
    <label className="inline-flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-emerald-500">
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-emerald-700">{icon}</span>
        <span className="break-words">{label}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-emerald-700"
      />
    </label>
  );
}

function SecondaryButton({
  icon,
  label,
  onClick,
  disabled = false
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:text-slate-400"
    >
      {icon}
      {label}
    </button>
  );
}

function PracticeModeControls({
  onHideSource,
  onHideTarget,
  onShowBoth,
  onToggleLowerRegisterHelper,
  compact = false
}: {
  onHideSource: () => void;
  onHideTarget: () => void;
  onShowBoth: () => void;
  onToggleLowerRegisterHelper: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Practice Mode
      </span>
      <div className={`grid rounded-2xl border border-slate-200 bg-slate-50 p-1 ${compact ? "w-full grid-cols-3" : "grid-cols-3"}`}>
        <PracticeButton icon={<Eye className="h-4 w-4" />} label="Both" onClick={onShowBoth} />
        <PracticeButton icon={<EyeOff className="h-4 w-4" />} label="Source" onClick={onHideSource} />
        <PracticeButton icon={<EyeOff className="h-4 w-4" />} label="Translation" onClick={onHideTarget} />
      </div>
      <button
        type="button"
        onClick={onToggleLowerRegisterHelper}
        className="inline-flex min-h-9 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-800 outline-none transition hover:bg-sky-100 focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        Lower Register
      </button>
    </div>
  );
}

function PracticeButton({
  icon,
  label,
  onClick
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-semibold text-slate-700 outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {icon}
      {label}
    </button>
  );
}

function ModeStatus({
  translationMode,
  activeTargetLanguage,
  detectedSourceLanguage
}: {
  translationMode: TranslationMode;
  activeTargetLanguage: OutputLanguage;
  detectedSourceLanguage: DetectedLanguage;
}) {
  if (translationMode !== "auto") {
    const modeConfig = TRANSLATION_MODES[translationMode];

    return (
      <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
        Current: {modeConfig.label}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950">
      <span>Auto mode is experimental.</span>
      <span>Detected: {getLanguageName(detectedSourceLanguage)}</span>
      <span>Output: {getLanguageName(activeTargetLanguage)}</span>
    </div>
  );
}
