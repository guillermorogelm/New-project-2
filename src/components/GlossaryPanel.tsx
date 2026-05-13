import { Lightbulb, Stethoscope } from "lucide-react";
import { MEDICAL_GLOSSARY, type GlossaryTerm } from "../utils/glossary";

type GlossaryPanelProps = {
  detectedTerms: GlossaryTerm[];
  showLowerRegisterHelper: boolean;
};

export function GlossaryPanel({ detectedTerms, showLowerRegisterHelper }: GlossaryPanelProps) {
  const detected = new Set(detectedTerms.map((term) => term.term.toLowerCase()));

  return (
    <aside className="space-y-4">
      <section className="rounded-lg border border-stone-200 bg-white shadow-soft">
        <div className="flex items-start gap-3 border-b border-stone-100 px-4 py-3">
          <Stethoscope className="mt-1 h-5 w-5 flex-none text-emerald-700" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-stone-950">Medical Helper</h2>
            <p className="text-sm leading-6 text-stone-600">Detected terms and built-in glossary.</p>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              Detected
            </p>
            {detectedTerms.length ? (
              <div className="flex flex-wrap gap-2">
                {detectedTerms.map((term) => (
                  <span
                    key={term.term}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900"
                  >
                    {term.term}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-stone-500">No glossary terms detected yet.</p>
            )}
          </div>

          <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
            {MEDICAL_GLOSSARY.map((term) => (
              <div
                key={term.term}
                className={`rounded-lg border px-3 py-2 ${
                  detected.has(term.term.toLowerCase())
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-stone-950">{term.term}</p>
                  {detected.has(term.term.toLowerCase()) ? (
                    <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-semibold text-white">
                      seen
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-stone-600">{term.english}</p>
                <p className="text-sm font-medium leading-6 text-stone-800">{term.spanish}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showLowerRegisterHelper ? (
        <section className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-4 text-sky-950">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-1 h-5 w-5 flex-none text-sky-700" aria-hidden="true" />
            <div>
              <h3 className="font-semibold">Lower Register Helper</h3>
              <p className="mt-1 text-sm leading-6">
                Convert technical language into patient-friendly language when appropriate. Example:
                "NPO" -&gt; "cannot eat or drink".
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </aside>
  );
}
