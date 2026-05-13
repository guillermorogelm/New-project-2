import { ShieldAlert } from "lucide-react";
import { useState } from "react";

export function Disclaimer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm leading-6 text-amber-950">
      <ShieldAlert className="h-4 w-4 flex-none text-amber-700" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        <strong>Training tool only.</strong> Do not use with real patient data or protected health
        information
        {expanded ? " unless you have permission and are following privacy rules." : "."}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="rounded-full px-2 py-1 text-xs font-semibold text-amber-900 outline-none transition hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-expanded={expanded}
      >
        {expanded ? "Less" : "More"}
      </button>
    </section>
  );
}
