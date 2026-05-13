import { describe, expect, it, vi } from "vitest";
import { registerSessionLifecycleHandlers } from "./sessionLifecycle";

describe("registerSessionLifecycleHandlers", () => {
  it("calls cleanup on beforeunload and pagehide", () => {
    const cleanupSession = vi.fn();
    const unregister = registerSessionLifecycleHandlers({
      isSessionActive: () => true,
      cleanupSession
    });

    window.dispatchEvent(new Event("beforeunload"));
    window.dispatchEvent(new Event("pagehide"));

    expect(cleanupSession).toHaveBeenCalledTimes(2);
    unregister();
  });
});
