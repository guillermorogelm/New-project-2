import { describe, expect, it } from "vitest";
import { detectEnglishOrSpanish } from "./languageDetection";

describe("detectEnglishOrSpanish", () => {
  it("returns es for Spanish text", () => {
    expect(
      detectEnglishOrSpanish(
        "Usted tiene dolor y necesito confirmar el medicamento para la receta."
      )
    ).toBe("es");
  });

  it("returns en for English text", () => {
    expect(
      detectEnglishOrSpanish(
        "The patient needs medication and has pain before the doctor appointment."
      )
    ).toBe("en");
  });

  it("returns unknown for short or ambiguous text", () => {
    expect(detectEnglishOrSpanish("pain")).toBe("unknown");
  });
});
