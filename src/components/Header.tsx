import { Clock3, Radio } from "lucide-react";
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
  idle: "border-slate-200 bg-slate-100 text-slate-700",
  connecting: "border-sky-200 bg-sky-50 text-sky-800",
  listening: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800"
};

export function Header({ status, durationSeconds }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-slate-200/80 bg-[#f7faf9]/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
          CMIT Live Interpreter Trainer
          </h1>
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            Live medical interpretation practice
          </p>
        </div>

        <div className="flex flex-none items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold sm:text-sm ${STATUS_STYLES[status]}`}
            aria-live="polite"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                status === "listening" ? "animate-pulse bg-emerald-600" : "bg-current opacity-60"
              }`}
              aria-hidden="true"
            />
            {STATUS_LABELS[status]}
          </span>
          {status === "listening" ? (
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white sm:inline-flex">
              <Radio className="h-3.5 w-3.5" aria-hidden="true" />
              Live
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm sm:text-sm">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDuration(durationSeconds)}
          </span>
        </div>
      </div>
    </header>
  );
}
