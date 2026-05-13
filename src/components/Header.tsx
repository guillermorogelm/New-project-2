import { Activity, Clock3 } from "lucide-react";
import type { RealtimeStatus } from "../hooks/useRealtimeTranslation";
import { formatDuration } from "../utils/format";

type HeaderProps = {
  status: RealtimeStatus;
  durationSeconds: number;
};

const STATUS_LABELS: Record<RealtimeStatus, string> = {
  idle: "Idle",
  connecting: "Connecting",
  listening: "Listening",
  error: "Error"
};

const STATUS_STYLES: Record<RealtimeStatus, string> = {
  idle: "border-stone-200 bg-white text-stone-700",
  connecting: "border-sky-200 bg-sky-50 text-sky-800",
  listening: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800"
};

export function Header({ status, durationSeconds }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white px-4 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Medical interpreter practice
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950 sm:text-3xl">
          CMIT Live Interpreter Trainer
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${STATUS_STYLES[status]}`}
          aria-live="polite"
        >
          <Activity className="h-4 w-4" aria-hidden="true" />
          {STATUS_LABELS[status]}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-semibold text-stone-700">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          {formatDuration(durationSeconds)}
        </span>
      </div>
    </header>
  );
}
