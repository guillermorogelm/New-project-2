export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function countWords(text: string): number {
  const matches = text.trim().match(/\S+/gu);
  return matches ? matches.length : 0;
}
