import { describe, expect, it } from "vitest";
import {
  calculateRms,
  getVoiceActivityState,
  SILENCE_AUTO_STOP_SECONDS
} from "./voiceActivity";

describe("voice activity utilities", () => {
  it("calculates RMS from time-domain samples", () => {
    expect(calculateRms(new Uint8Array([128, 128, 128]))).toBe(0);
    expect(calculateRms(new Uint8Array([255, 128, 1]))).toBeGreaterThan(0.5);
  });

  it("resets silence countdown when voice is detected", () => {
    const state = getVoiceActivityState(0.03, 42);

    expect(state.isVoiceDetected).toBe(true);
    expect(state.silenceSeconds).toBe(0);
    expect(state.autoStopCountdownSeconds).toBe(SILENCE_AUTO_STOP_SECONDS);
  });
});
