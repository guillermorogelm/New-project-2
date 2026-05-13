import { describe, expect, it } from "vitest";
import { emptyTranscriptState, transcriptEventReducer } from "./transcriptEvents";

describe("transcriptEventReducer", () => {
  it("appends input transcript deltas to the source transcript", () => {
    const state = transcriptEventReducer(emptyTranscriptState, {
      type: "session.input_transcript.delta",
      delta: "The patient is NPO."
    });

    expect(state.sourceTranscript).toBe("The patient is NPO.");
    expect(state.translatedTranscript).toBe("");
  });

  it("appends output transcript deltas to the translated transcript", () => {
    const state = transcriptEventReducer(emptyTranscriptState, {
      type: "session.output_transcript.delta",
      delta: "El paciente no puede comer ni beber."
    });

    expect(state.sourceTranscript).toBe("");
    expect(state.translatedTranscript).toBe("El paciente no puede comer ni beber.");
  });

  it("ignores unknown events", () => {
    const initialState = {
      sourceTranscript: "Hello",
      translatedTranscript: "Hola"
    };

    const state = transcriptEventReducer(initialState, {
      type: "something.else",
      delta: "Ignored"
    });

    expect(state).toEqual(initialState);
  });
});
