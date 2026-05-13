import { useEffect, useMemo, useRef } from "react";
import { countWords } from "../utils/format";
import { tokenizeHighlights, type HighlightKind } from "../utils/highlightTerms";

type TranscriptPanelProps = {
  title: string;
  label: string;
  text: string;
  emptyText: string;
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
  hidden = false,
  highlightMedicalTerms
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const segments = useMemo(
    () => splitTranscriptSegments(text, highlightMedicalTerms),
    [text, highlightMedicalTerms]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [text, hidden]);

  return (
    <section className="flex min-h-[360px] min-w-0 flex-col rounded-lg border border-stone-200 bg-white shadow-soft">
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">{label}</p>
          <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
        </div>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
          {countWords(text)} words
        </span>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-xl leading-9 text-stone-950 sm:text-2xl sm:leading-10"
        aria-live="polite"
      >
        {hidden ? (
          <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-base font-semibold text-stone-500">
            Hidden for practice
          </p>
        ) : text.trim() ? (
          <div className="whitespace-pre-wrap break-words">
            {segments.map((segment, segmentIndex) =>
              segment.kind === "marker" ? (
                <div
                  key={`${segment.text}-${segmentIndex}`}
                  className="my-4 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold leading-6 text-emerald-900"
                >
                  {segment.text}
                </div>
              ) : (
                <span key={`${segment.text}-${segmentIndex}`}>
                  {segment.tokens.map((token, tokenIndex) =>
                    token.kind === "plain" ? (
                      <span key={`${token.text}-${tokenIndex}`}>{token.text}</span>
                    ) : (
                      <span
                        key={`${token.text}-${tokenIndex}`}
                        className={`mx-0.5 inline rounded-md px-1.5 py-0.5 text-[0.92em] ${HIGHLIGHT_STYLES[token.kind]}`}
                      >
                        {token.text}
                      </span>
                    )
                  )}
                </span>
              )
            )}
          </div>
        ) : (
          <p className="text-base leading-7 text-stone-500">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

function splitTranscriptSegments(text: string, highlightMedicalTerms: boolean) {
  return text
    .split(/(--- Direction switched to .+? ---)/gu)
    .filter(Boolean)
    .map((segment) =>
      segment.startsWith("--- Direction switched to")
        ? ({ kind: "marker" as const, text: segment })
        : ({
            kind: "text" as const,
            text: segment,
            tokens: tokenizeHighlights(segment, highlightMedicalTerms)
          })
    );
}
