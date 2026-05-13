export type TranscriptState = {
  sourceTranscript: string;
  translatedTranscript: string;
};

export type RealtimeTranscriptEvent = {
  type?: string;
  delta?: unknown;
  text?: unknown;
  transcript?: unknown;
};

export const emptyTranscriptState: TranscriptState = {
  sourceTranscript: "",
  translatedTranscript: ""
};

export function transcriptEventReducer(
  state: TranscriptState,
  event: RealtimeTranscriptEvent
): TranscriptState {
  if (event.type === "reset") {
    return emptyTranscriptState;
  }

  const delta = readDelta(event);

  if (!delta) {
    return state;
  }

  if (event.type === "session.input_transcript.delta") {
    return {
      ...state,
      sourceTranscript: appendDelta(state.sourceTranscript, delta)
    };
  }

  if (event.type === "session.output_transcript.delta") {
    return {
      ...state,
      translatedTranscript: appendDelta(state.translatedTranscript, delta)
    };
  }

  return state;
}

function readDelta(event: RealtimeTranscriptEvent): string {
  if (typeof event.delta === "string") {
    return event.delta;
  }

  if (typeof event.text === "string") {
    return event.text;
  }

  if (typeof event.transcript === "string") {
    return event.transcript;
  }

  return "";
}

function appendDelta(current: string, delta: string): string {
  return `${current}${delta}`;
}
