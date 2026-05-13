import { describe, expect, it } from "vitest";
import {
  deletePracticeSession,
  getSavedSessions,
  savePracticeSession
} from "./sessionStorage";

describe("sessionStorage helpers", () => {
  it("saves and deletes local practice sessions", () => {
    const saved = savePracticeSession({
      sourceTranscript: "Patient has COPD.",
      translatedTranscript: "El paciente tiene EPOC.",
      detectedTerms: [{ term: "COPD", english: "chronic obstructive pulmonary disease", spanish: "EPOC" }]
    });

    expect(getSavedSessions()).toHaveLength(1);
    expect(getSavedSessions()[0]).toMatchObject({
      id: saved.id,
      sourceTranscript: "Patient has COPD.",
      translatedTranscript: "El paciente tiene EPOC."
    });

    deletePracticeSession(saved.id);

    expect(getSavedSessions()).toEqual([]);
  });
});
