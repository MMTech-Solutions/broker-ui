import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { FinanceFilters, FinanceKind, FinanceTransaction } from "./types";

export function listFinanceTransactions(kind: FinanceKind, filters: FinanceFilters, signal?: AbortSignal) {
  const searchParams = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  ) as Record<string, string | number>;
  return browserBrokerRequest<FinanceTransaction[]>(`v1/admin/finance/${kind}`, { searchParams, signal });
}

export function showFinanceTransaction(kind: FinanceKind, id: string, signal?: AbortSignal) {
  return browserBrokerRequest<FinanceTransaction>(`v1/admin/finance/${kind}/${encodeURIComponent(id)}`, { signal });
}
