import { ChevronDown, Eye, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SavedPracticeSession } from "../utils/sessionStorage";
import { stripDirectionMarkers } from "../utils/transcriptText";

type SavedSessionsPanelProps = {
  sessions: SavedPracticeSession[];
  onDelete: (id: string) => void;
};

export function SavedSessionsPanel({ sessions, onDelete }: SavedSessionsPanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedId) ?? null,
    [sessions, selectedId]
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-950">Saved Sessions</h2>
          <p className="text-sm leading-6 text-slate-500">
            {sessions.length} saved locally on this device
          </p>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="border-t border-slate-100 px-4 py-4">
          {!sessions.length ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">
              Saved practice sessions will appear here. Nothing syncs anywhere.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {sessions.map((session) => (
                  <article
                    key={session.id}
                    className={`rounded-2xl border px-3 py-3 ${
                      selectedSession?.id === session.id
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-950">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      }).format(new Date(session.timestamp))}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {session.direction ?? "Direction not recorded"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {session.detectedTerms.map((term) => term.term).join(", ") ||
                        "No detected terms"}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(session.id)}
                        className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(session.id)}
                        className="inline-flex min-h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 outline-none transition hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500"
                        aria-label="Delete saved session"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {selectedSession ? (
                <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <p className="text-sm font-semibold text-slate-950">
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "full",
                      timeStyle: "short"
                    }).format(new Date(selectedSession.timestamp))}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {selectedSession.direction ?? "Direction not recorded"}
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <SavedText title="Source" text={stripDirectionMarkers(selectedSession.sourceTranscript)} />
                    <SavedText
                      title="Translation"
                      text={stripDirectionMarkers(selectedSession.translatedTranscript)}
                    />
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm leading-6 text-slate-500">
                  Select a session to view its transcript.
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function SavedText({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
      <p className="mt-2 max-h-52 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
        {text || "No text saved."}
      </p>
    </div>
  );
}
