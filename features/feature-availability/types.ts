export const FEATURE_NAMES = ["ib", "insurance", "bonus", "contests", "trading"] as const;
export type FeatureName = (typeof FEATURE_NAMES)[number];
export type FeatureState = { feature: FeatureName; enable: boolean };
export type FeatureStates = Record<FeatureName, boolean>;
export const DISABLED_FEATURES: FeatureStates = { ib: false, insurance: false, bonus: false, contests: false, trading: false };
export function featureForPage(path: string): FeatureName | null {
  if (path === "/reports" || path.startsWith("/reports/") || path.startsWith("/ib-analytics") || path.startsWith("/client/ib/analytics")) return null;
  const groups: Array<[FeatureName, string[]]> = [
    ["trading", ["/platforms", "/trading-accounts", "/trading-migrations", "/positions", "/leverages", "/initial-amounts", "/symbol-categories", "/client/accounts"]],
    ["ib", ["/ib-plans", "/ib-programs", "/ib-subscriptions", "/ib-payment-templates", "/ib-progression-templates", "/ib-rewards", "/ib-reward-logs", "/ib-program-payment-rules", "/client/ib"]],
    ["bonus", ["/bonus-offers", "/bonus-offer-templates", "/bonus-assignment-logs", "/client/bonuses"]],
    ["insurance", ["/insurance", "/client/insurance"]],
    ["contests", ["/contests", "/contest-conditions", "/contest-awards", "/contest-subscriptions", "/contest-settings", "/client/contests", "/client/help"]],
  ];
  return groups.find(([, prefixes]) => prefixes.some((prefix) => path === prefix || path.startsWith(prefix + "/")))?.[0] ?? null;
}
