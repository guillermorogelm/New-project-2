import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SavedPracticeSession } from "../utils/sessionStorage";

type SavedSessionsPanelProps = {
  sessions: SavedPracticeSession[];
  onDelete: (id: string) => void;
};

export function SavedSessionsPanel({ sessions, onDelete }: SavedSessionsPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedId) ?? sessions[0],
    [sessions, selectedId]
  );

  if (!sessions.length) {
    return (
      <section className="rounded-lg border border-stone-200 bg-white px-4 py-4 shadow-soft">
        <h2 className="text-lg font-semibold text-stone-950">Saved Sessions</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Saved practice sessions stay in this browser only.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-soft">
      <div className="border-b border-stone-100 px-4 py-3">
        <h2 className="text-lg font-semibold text-stone-950">Saved Sessions</h2>
        <p className="text-sm leading-6 text-stone-500">Local to this device and browser.</p>
      </div>

      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => setSelectedId(session.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                selectedSession?.id === session.id
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <p className="text-sm font-semibold text-stone-950">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(session.timestamp))}
              </p>
              <p className="mt-1 truncate text-xs text-stone-500">
                {session.detectedTerms.map((term) => term.term).join(", ") || "No detected terms"}
              </p>
            </button>
          ))}
        </div>

        {selectedSession ? (
          <div className="min-w-0 rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-950">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "full",
                    timeStyle: "short"
                  }).format(new Date(selectedSession.timestamp))}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {selectedSession.detectedTerms.length} detected glossary terms
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDelete(selectedSession.id)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SavedText title="English" text={selectedSession.sourceTranscript} />
              <SavedText title="Spanish" text={selectedSession.translatedTranscript} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SavedText({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-stone-200 bg-white px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">{title}</p>
      <p className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-stone-800">
        {text || "No text saved."}
      </p>
    </div>
  );
}
