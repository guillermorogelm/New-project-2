import type { GlossaryTerm } from "./glossary";

export type SavedPracticeSession = {
  id: string;
  timestamp: string;
  direction?: string;
  sourceTranscript: string;
  translatedTranscript: string;
  detectedTerms: GlossaryTerm[];
};

const STORAGE_KEY = "cmit-live-interpreter-trainer:saved-sessions";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getSavedSessions(storage: StorageLike = window.localStorage): SavedPracticeSession[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePracticeSession(
  session: Omit<SavedPracticeSession, "id" | "timestamp">,
  storage: StorageLike = window.localStorage
): SavedPracticeSession {
  const saved: SavedPracticeSession = {
    ...session,
    id: createId(),
    timestamp: new Date().toISOString()
  };

  const sessions = [saved, ...getSavedSessions(storage)];
  storage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return saved;
}

export function deletePracticeSession(id: string, storage: StorageLike = window.localStorage): void {
  const sessions = getSavedSessions(storage).filter((session) => session.id !== id);
  storage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function clearSavedSessions(storage: StorageLike = window.localStorage): void {
  storage.removeItem(STORAGE_KEY);
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
