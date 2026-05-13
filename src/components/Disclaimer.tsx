import { ShieldAlert } from "lucide-react";

export function Disclaimer() {
  return (
    <section className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
      <ShieldAlert className="mt-0.5 h-5 w-5 flex-none text-amber-700" aria-hidden="true" />
      <p>
        <strong>Training tool only.</strong> Do not use with real patient data or protected
        health information unless you have permission and are following privacy rules.
      </p>
    </section>
  );
}
