import { describe, expect, it } from "vitest";
import {
  getModeTargetLanguage,
  getSwitchedMode,
  mapDetectedLanguageToOutputLanguage
} from "./translationModes";

describe("translation mode helpers", () => {
  it("maps English to Spanish mode to targetLanguage es", () => {
    expect(getModeTargetLanguage("en_to_es")).toBe("es");
  });

  it("maps Spanish to English mode to targetLanguage en", () => {
    expect(getModeTargetLanguage("es_to_en")).toBe("en");
  });

  it("toggles switch direction from en_to_es to es_to_en", () => {
    expect(getSwitchedMode("en_to_es")).toBe("es_to_en");
  });

  it("maps detected English to Spanish output in auto mode", () => {
    expect(mapDetectedLanguageToOutputLanguage("en")).toBe("es");
  });

  it("maps detected Spanish to English output in auto mode", () => {
    expect(mapDetectedLanguageToOutputLanguage("es")).toBe("en");
  });
});
