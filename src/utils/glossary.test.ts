import { describe, expect, it } from "vitest";
import { detectGlossaryTerms } from "./glossary";

describe("detectGlossaryTerms", () => {
  it("detects NPO, COPD, dyspnea, and wheezing", () => {
    const terms = detectGlossaryTerms(
      "The patient with COPD has dyspnea and wheezing. Keep them NPO after midnight."
    ).map((term) => term.term);

    expect(terms).toEqual(expect.arrayContaining(["NPO", "COPD", "dyspnea", "wheezing"]));
  });
});
