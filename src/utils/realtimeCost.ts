export const REALTIME_TRANSLATE_COST_PER_MINUTE = 0.034;
export const REALTIME_TRANSLATE_COST_PER_SECOND = REALTIME_TRANSLATE_COST_PER_MINUTE / 60;
export const COST_ALERT_INTERVAL_SECONDS = 30 * 60;

export function estimateRealtimeCost(seconds: number): number {
  return Math.max(0, seconds) * REALTIME_TRANSLATE_COST_PER_SECOND;
}

export function formatUsdCost(amount: number): string {
  return `~$${Math.max(0, amount).toFixed(2)}`;
}

export function getCostAlertInterval(seconds: number): number {
  return Math.floor(seconds / COST_ALERT_INTERVAL_SECONDS);
}

export function shouldShowCostAlert(seconds: number, lastAlertedInterval: number): boolean {
  const interval = getCostAlertInterval(seconds);
  return interval > 0 && interval > lastAlertedInterval;
}

export function createCostReminderMessage(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `Cost reminder: You have been listening for ${minutes} minutes. Estimated API usage: ${formatUsdCost(
    estimateRealtimeCost(seconds)
  )}.`;
}
