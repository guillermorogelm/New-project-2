type SessionLifecycleOptions = {
  isSessionActive: () => boolean;
  cleanupSession: () => void;
  onBackgroundWarning?: () => void;
  backgroundAutoStopMs?: number;
  setTimeoutFn?: typeof window.setTimeout;
  clearTimeoutFn?: typeof window.clearTimeout;
};

export function registerSessionLifecycleHandlers({
  isSessionActive,
  cleanupSession,
  onBackgroundWarning,
  backgroundAutoStopMs = 30_000,
  setTimeoutFn = window.setTimeout,
  clearTimeoutFn = window.clearTimeout
}: SessionLifecycleOptions): () => void {
  let backgroundTimer: number | null = null;

  const clearBackgroundTimer = () => {
    if (backgroundTimer !== null) {
      clearTimeoutFn(backgroundTimer);
      backgroundTimer = null;
    }
  };

  const cleanup = () => {
    clearBackgroundTimer();
    if (isSessionActive()) {
      cleanupSession();
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && isSessionActive()) {
      onBackgroundWarning?.();
      clearBackgroundTimer();
      backgroundTimer = setTimeoutFn(() => {
        if (isSessionActive()) {
          cleanupSession();
        }
      }, backgroundAutoStopMs);
      return;
    }

    clearBackgroundTimer();
  };

  window.addEventListener("beforeunload", cleanup);
  window.addEventListener("pagehide", cleanup);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    clearBackgroundTimer();
    window.removeEventListener("beforeunload", cleanup);
    window.removeEventListener("pagehide", cleanup);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
