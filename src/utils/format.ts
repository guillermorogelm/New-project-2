export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

export function countWords(text: string): number {
  const matches = text.trim().match(/\S+/gu);
  return matches ? matches.length : 0;
}
