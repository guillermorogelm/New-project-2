import { useEffect, useMemo, useRef } from "react";
import { countWords } from "../utils/format";
import { tokenizeHighlights, type HighlightKind } from "../utils/highlightTerms";
import { stripDirectionMarkers } from "../utils/transcriptText";

type TranscriptPanelProps = {
  title: string;
  label: string;
  text: string;
  emptyText: string;
  directionLabel: string;
  isListening: boolean;
  hidden?: boolean;
  highlightMedicalTerms: boolean;
};

const HIGHLIGHT_STYLES: Record<HighlightKind, string> = {
  plain: "",
  medical: "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200",
  number: "bg-sky-100 text-sky-950 ring-1 ring-sky-200",
  date: "bg-violet-100 text-violet-950 ring-1 ring-violet-200",
  time: "bg-violet-100 text-violet-950 ring-1 ring-violet-200",
  measurement: "bg-cyan-100 text-cyan-950 ring-1 ring-cyan-200",
  medication: "bg-rose-100 text-rose-950 ring-1 ring-rose-200",
  acronym: "bg-amber-100 text-amber-950 ring-1 ring-amber-200"
};

export function TranscriptPanel({
  title,
  label,
  text,
  emptyText,
  directionLabel,
  isListening,
  hidden = false,
  highlightMedicalTerms
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const visibleText = useMemo(() => stripDirectionMarkers(text), [text]);
  const tokens = useMemo(
    () => tokenizeHighlights(visibleText, highlightMedicalTerms),
    [visibleText, highlightMedicalTerms]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleText, hidden]);

  return (
    <section className="flex min-h-[420px] min-w-0 flex-col rounded-3xl border border-slate-200 bg-white shadow-soft lg:h-[calc(100vh-255px)] lg:max-h-[700px] lg:min-h-[480px]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
          <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            Current: {directionLabel}
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {countWords(visibleText)} words
        </span>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-xl leading-9 text-slate-950 sm:px-5 sm:text-[22px] sm:leading-10 lg:text-2xl lg:leading-[2.85rem]"
        aria-live="polite"
      >
        {hidden ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-base font-semibold text-slate-500">
            Hidden for practice
          </p>
        ) : visibleText.trim() ? (
          <p className="whitespace-pre-wrap break-words">
            {tokens.map((token, index) =>
              token.kind === "plain" ? (
                <span key={`${token.text}-${index}`}>{token.text}</span>
              ) : (
                <span
                  key={`${token.text}-${index}`}
                  className={`mx-0.5 inline rounded-md px-1.5 py-0.5 text-[0.92em] ${HIGHLIGHT_STYLES[token.kind]}`}
                >
                  {token.text}
                </span>
              )
            )}
          </p>
        ) : (
          <div className="flex min-h-full items-center justify-center">
            <div className="max-w-sm rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
              {isListening ? (
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-700" />
                </span>
              ) : null}
              <p className="text-base font-semibold leading-7 text-slate-600">
                {isListening ? "Listening for speech..." : emptyText}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
