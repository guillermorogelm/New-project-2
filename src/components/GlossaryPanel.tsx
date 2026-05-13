import { ChevronDown, Lightbulb, Search, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { MEDICAL_GLOSSARY, type GlossaryTerm } from "../utils/glossary";

type GlossaryPanelProps = {
  detectedTerms: GlossaryTerm[];
  showLowerRegisterHelper: boolean;
};

export function GlossaryPanel({ detectedTerms, showLowerRegisterHelper }: GlossaryPanelProps) {
  const [query, setQuery] = useState("");
  const detected = new Set(detectedTerms.map((term) => term.term.toLowerCase()));
  const filteredGlossary = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return MEDICAL_GLOSSARY;
    }

    return MEDICAL_GLOSSARY.filter((term) =>
      [term.term, term.english, term.spanish].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query]);

  return (
    <aside className="min-w-0 space-y-3">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">Medical Helper</h2>
            <p className="text-sm leading-6 text-slate-500">Terms, acronyms, and register cues.</p>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Detected terms
              </h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {detectedTerms.length}
              </span>
            </div>

            {detectedTerms.length ? (
              <div className="space-y-2">
                {detectedTerms.map((term) => (
                  <div
                    key={term.term}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-emerald-950">{term.term}</p>
                    <p className="text-xs leading-5 text-emerald-900">{term.english}</p>
                    <p className="text-xs font-medium leading-5 text-emerald-950">{term.spanish}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">
                Detected medical terms will appear here during practice.
              </p>
            )}
          </section>

          {showLowerRegisterHelper ? (
            <section className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-sky-950">
              <div className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 flex-none text-sky-700" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold">Lower Register Helper</h3>
                  <p className="mt-1 text-sm leading-6">
                    Convert technical language into patient-friendly language when appropriate.
                    Example: "NPO" -&gt; "cannot eat or drink".
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <details className="group rounded-2xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500">
              Built-in glossary
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
            </summary>

            <div className="border-t border-slate-100 px-3 py-3">
              <label className="mb-3 flex min-h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span className="sr-only">Search glossary</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search glossary"
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
                {filteredGlossary.map((term) => (
                  <div
                    key={term.term}
                    className={`rounded-2xl border px-3 py-2 ${
                      detected.has(term.term.toLowerCase())
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-950">{term.term}</p>
                      {detected.has(term.term.toLowerCase()) ? (
                        <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-semibold text-white">
                          seen
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs leading-5 text-slate-600">{term.english}</p>
                    <p className="text-xs font-medium leading-5 text-slate-800">{term.spanish}</p>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </div>
      </section>
    </aside>
  );
}
