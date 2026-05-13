export type OutputLanguage = "en" | "es";
export type TranslationMode = "en_to_es" | "es_to_en" | "auto";
export type DetectedLanguage = OutputLanguage | "unknown";

export const TRANSLATION_MODES = {
  en_to_es: {
    label: "English → Spanish",
    sourceLanguage: "en",
    targetLanguage: "es",
    sourceLabel: "English Transcript",
    targetLabel: "Spanish Translation"
  },
  es_to_en: {
    label: "Spanish → English",
    sourceLanguage: "es",
    targetLanguage: "en",
    sourceLabel: "Spanish Transcript",
    targetLabel: "English Translation"
  },
  auto: {
    label: "Auto Detect",
    sourceLanguage: "auto",
    targetLanguage: "es",
    sourceLabel: "Source Transcript",
    targetLabel: "Auto Translation"
  }
} satisfies Record<
  TranslationMode,
  {
    label: string;
    sourceLanguage: OutputLanguage | "auto";
    targetLanguage: OutputLanguage;
    sourceLabel: string;
    targetLabel: string;
  }
>;

export function getModeTargetLanguage(mode: TranslationMode): OutputLanguage {
  return TRANSLATION_MODES[mode].targetLanguage;
}

export function getSwitchedMode(mode: TranslationMode): TranslationMode {
  if (mode === "en_to_es") {
    return "es_to_en";
  }

  return "en_to_es";
}

export function mapDetectedLanguageToOutputLanguage(
  detectedLanguage: DetectedLanguage
): OutputLanguage | null {
  if (detectedLanguage === "en") {
    return "es";
  }

  if (detectedLanguage === "es") {
    return "en";
  }

  return null;
}

export function getLanguageName(language: DetectedLanguage): string {
  if (language === "en") {
    return "English";
  }

  if (language === "es") {
    return "Spanish";
  }

  return "Detecting...";
}
