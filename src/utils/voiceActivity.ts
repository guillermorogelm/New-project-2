export const SILENCE_AUTO_STOP_SECONDS = 180;
export const SILENCE_RMS_THRESHOLD = 0.015;

export function calculateRms(samples: Uint8Array): number {
  if (!samples.length) {
    return 0;
  }

  let sumSquares = 0;

  for (const sample of samples) {
    const normalized = (sample - 128) / 128;
    sumSquares += normalized * normalized;
  }

  return Math.sqrt(sumSquares / samples.length);
}

export function isVoiceAboveThreshold(
  rms: number,
  threshold = SILENCE_RMS_THRESHOLD
): boolean {
  return rms >= threshold;
}

export function getSilenceCountdownSeconds(
  silenceSeconds: number,
  autoStopSeconds = SILENCE_AUTO_STOP_SECONDS
): number {
  return Math.max(0, autoStopSeconds - Math.floor(Math.max(0, silenceSeconds)));
}

export function getVoiceActivityState(
  rms: number,
  silenceSeconds: number,
  threshold = SILENCE_RMS_THRESHOLD,
  autoStopSeconds = SILENCE_AUTO_STOP_SECONDS
) {
  const isVoiceDetected = isVoiceAboveThreshold(rms, threshold);
  return {
    isVoiceDetected,
    silenceSeconds: isVoiceDetected ? 0 : silenceSeconds,
    autoStopCountdownSeconds: isVoiceDetected
      ? autoStopSeconds
      : getSilenceCountdownSeconds(silenceSeconds, autoStopSeconds)
  };
}
