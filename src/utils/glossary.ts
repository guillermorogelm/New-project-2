export type GlossaryTerm = {
  term: string;
  english: string;
  spanish: string;
};

export const MEDICAL_GLOSSARY: GlossaryTerm[] = [
  { term: "NPO", english: "nothing by mouth", spanish: "no comer ni beber / nada por vía oral" },
  { term: "PRN", english: "as needed", spanish: "según sea necesario" },
  { term: "Q6", english: "every 6 hours", spanish: "cada 6 horas" },
  { term: "PO", english: "by mouth", spanish: "por vía oral" },
  { term: "IV", english: "intravenous", spanish: "intravenoso / por vía intravenosa" },
  { term: "COPD", english: "chronic obstructive pulmonary disease", spanish: "EPOC" },
  { term: "CXR", english: "chest X-ray", spanish: "radiografía de tórax" },
  { term: "ENT", english: "ear, nose and throat", spanish: "otorrinolaringología" },
  { term: "RSV", english: "respiratory syncytial virus", spanish: "VSR" },
  { term: "TB", english: "tuberculosis", spanish: "tuberculosis" },
  { term: "dyspnea", english: "shortness of breath", spanish: "disnea / falta de aire" },
  { term: "wheezing", english: "wheezing", spanish: "sibilancias" },
  { term: "hypoxemia", english: "hypoxemia", spanish: "hipoxemia" },
  { term: "pneumonia", english: "pneumonia", spanish: "neumonía" },
  { term: "asthma", english: "asthma", spanish: "asma" },
  { term: "inhaler", english: "inhaler", spanish: "inhalador" },
  { term: "prescription", english: "prescription", spanish: "receta" },
  { term: "dosage", english: "dosage", spanish: "dosis" }
];

export function detectGlossaryTerms(
  text: string,
  glossary: GlossaryTerm[] = MEDICAL_GLOSSARY
): GlossaryTerm[] {
  if (!text.trim()) {
    return [];
  }

  const found = new Map<string, GlossaryTerm>();

  for (const entry of glossary) {
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(entry.term)}(?=$|[^\\p{L}\\p{N}])`, "iu");
    if (pattern.test(text)) {
      found.set(entry.term.toLowerCase(), entry);
    }
  }

  return Array.from(found.values());
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
