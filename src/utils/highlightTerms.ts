import { detectGlossaryTerms } from "./glossary";

export type HighlightKind =
  | "plain"
  | "medical"
  | "number"
  | "date"
  | "time"
  | "measurement"
  | "medication"
  | "acronym";

export type HighlightToken = {
  text: string;
  kind: HighlightKind;
};

const TOKEN_PATTERN = /(\s+|[A-Za-z]+(?:-[A-Za-z]+)?|\d+(?:[./:-]\d+)*(?:\s?(?:mg|mcg|g|kg|mL|ml|L|cm|mm|mmHg|bpm|%|°F|°C))?|[^\s])/gu;
const MEASUREMENT_PATTERN = /^\d+(?:[./:-]\d+)*(?:\s?(?:mg|mcg|g|kg|mL|ml|L|cm|mm|mmHg|bpm|%|°F|°C))$/iu;
const DATE_PATTERN = /^(?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{4}-\d{1,2}-\d{1,2})$/u;
const TIME_PATTERN = /^\d{1,2}(?::\d{2})?\s?(?:am|pm|a\.m\.|p\.m\.)?$/iu;
const NUMBER_PATTERN = /^\d+(?:[.,]\d+)?$/u;
const ACRONYM_PATTERN = /^[A-Z]{2,6}\d?$/u;
const MEDICATION_PATTERN = /(?:cillin|pril|sartan|statin|olol|prazole|mycin|mab|vir|zepam|insulin|albuterol|metformin)$/iu;

export function tokenizeHighlights(text: string, enableMedicalTerms: boolean): HighlightToken[] {
  const medicalTerms = enableMedicalTerms
    ? new Set(detectGlossaryTerms(text).map((term) => term.term.toLowerCase()))
    : new Set<string>();

  const tokens = text.match(TOKEN_PATTERN) ?? [];

  return tokens.map((token) => ({
    text: token,
    kind: classifyToken(token, medicalTerms)
  }));
}

function classifyToken(token: string, medicalTerms: Set<string>): HighlightKind {
  if (/^\s+$/u.test(token)) {
    return "plain";
  }

  const normalized = token.toLowerCase();

  if (medicalTerms.has(normalized)) {
    return "medical";
  }

  if (MEASUREMENT_PATTERN.test(token)) {
    return "measurement";
  }

  if (DATE_PATTERN.test(token)) {
    return "date";
  }

  if (TIME_PATTERN.test(token) && /\d/u.test(token) && /am|pm|a\.m\.|p\.m\.|:/iu.test(token)) {
    return "time";
  }

  if (NUMBER_PATTERN.test(token)) {
    return "number";
  }

  if (ACRONYM_PATTERN.test(token)) {
    return "acronym";
  }

  if (MEDICATION_PATTERN.test(token)) {
    return "medication";
  }

  return "plain";
}
