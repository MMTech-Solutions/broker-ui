import { MASKED_SECRET_VALUE } from "@/features/configuration/types";
import type { BrokerConfig } from "@/features/configuration/types";

const CATEGORY_LABELS: Record<string, string> = {
  apicore: "API Core / IAM",
  trading: "Trading",
  finance: "Finance",
  ib: "IB",
  risk: "Risk",
  contests: "Contests",
  insurance: "Insurance",
  open_positions_bridge: "Open positions bridge",
  scheduling: "Scheduling",
  user: "User",
  bonus: "Bonus",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function groupConfigsByCategory(
  configs: BrokerConfig[],
): Array<{ category: string; items: BrokerConfig[] }> {
  const map = new Map<string, BrokerConfig[]>();

  for (const config of configs) {
    const list = map.get(config.category) ?? [];
    list.push(config);
    map.set(config.category, list);
  }

  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

export function displayValueForForm(config: BrokerConfig): string {
  if (config.is_secret && config.value === MASKED_SECRET_VALUE) {
    return "";
  }

  if (config.schema.type === "bool") {
    return config.value === "true" || config.value === "1" ? "true" : "false";
  }

  return config.value ?? "";
}

export function serializeValueForSubmit(
  config: BrokerConfig,
  formValue: string,
): string | null {
  if (config.is_secret && formValue.trim() === "") {
    return "";
  }

  if (config.schema.type === "bool") {
    return formValue === "true" ? "true" : "false";
  }

  return formValue;
}
