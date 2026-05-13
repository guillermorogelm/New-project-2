const DIRECTION_MARKER_PATTERN = /--- Direction switched to .+? ---/gu;

export function stripDirectionMarkers(text: string): string {
  return text
    .replace(DIRECTION_MARKER_PATTERN, "")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

export function extractDirectionMarkers(text: string): string[] {
  const markers = text.match(DIRECTION_MARKER_PATTERN) ?? [];
  return Array.from(new Set(markers.map((marker) => marker.replace(/^--- | ---$/gu, ""))));
}
