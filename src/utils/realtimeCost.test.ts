import { describe, expect, it } from "vitest";
import { formatDuration } from "./format";
import {
  createCostReminderMessage,
  estimateRealtimeCost,
  formatUsdCost,
  shouldShowCostAlert
} from "./realtimeCost";

describe("realtime cost utilities", () => {
  it("formats duration below and above one hour", () => {
    expect(formatDuration(13)).toBe("00:13");
    expect(formatDuration(4462)).toBe("01:14:22");
  });

  it("formats USD cost", () => {
    expect(formatUsdCost(0.0073)).toBe("~$0.01");
  });

  it("estimates cost from seconds", () => {
    expect(estimateRealtimeCost(1800)).toBeCloseTo(1.02);
  });

  it("triggers 30-minute cost alerts once per interval", () => {
    expect(shouldShowCostAlert(1799, 0)).toBe(false);
    expect(shouldShowCostAlert(1800, 0)).toBe(true);
    expect(shouldShowCostAlert(1801, 1)).toBe(false);
    expect(shouldShowCostAlert(3600, 1)).toBe(true);
    expect(createCostReminderMessage(1800)).toContain("Estimated API usage: ~$1.02.");
  });
});
