import type { DetectedLanguage } from "./translationModes";

const RECENT_CHARACTER_LIMIT = 220;
const MINIMUM_INDICATOR_HITS = 3;

const SPANISH_WORDS = new Set([
  "el",
  "la",
  "los",
  "las",
  "que",
  "de",
  "del",
  "para",
  "con",
  "sin",
  "usted",
  "tiene",
  "dolor",
  "necesito",
  "puedo",
  "medicamento",
  "receta"
]);

const ENGLISH_WORDS = new Set([
  "the",
  "you",
  "patient",
  "need",
  "have",
  "pain",
  "medication",
  "prescription",
  "doctor",
  "nurse",
  "symptoms",
  "test",
  "blood",
  "appointment"
]);

export function detectEnglishOrSpanish(text: string): DetectedLanguage {
  const recentText = text.slice(-RECENT_CHARACTER_LIMIT).toLowerCase();
  if (!recentText.trim()) {
    return "unknown";
  }

  const tokens = recentText.match(/\p{L}+/gu) ?? [];
  const spanishScore = countIndicatorHits(tokens, SPANISH_WORDS) + countSpanishAccents(recentText);
  const englishScore = countIndicatorHits(tokens, ENGLISH_WORDS);

  if (spanishScore >= MINIMUM_INDICATOR_HITS && spanishScore > englishScore) {
    return "es";
  }

  if (englishScore >= MINIMUM_INDICATOR_HITS && englishScore > spanishScore) {
    return "en";
  }

  return "unknown";
}

function countIndicatorHits(tokens: string[], indicators: Set<string>): number {
  return tokens.reduce((count, token) => count + (indicators.has(token) ? 1 : 0), 0);
}

function countSpanishAccents(text: string): number {
  return text.match(/[áéíóúñ]/gu)?.length ?? 0;
}
