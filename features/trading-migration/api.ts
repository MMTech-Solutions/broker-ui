import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessMeta, BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type { StartTradingMigrationInput, StartTradingMigrationResult, TradingMigrationAccount, TradingMigrationRun } from "@/features/trading-migration/types";

const BASE_PATH = "v1/admin/trading-migrations";
type PaginatedResponse<T> = BrokerSuccessResponse<T[]> & { meta: BrokerSuccessMeta };

export function listMigrationAccounts(params: { status: "pending" | "migrated"; page?: number; per_page?: number }): Promise<PaginatedResponse<TradingMigrationAccount>> {
  return browserBrokerRequest(`${BASE_PATH}/accounts`, { searchParams: params });
}
export function listMigrationRuns(params: { page?: number; per_page?: number } = {}): Promise<PaginatedResponse<TradingMigrationRun>> {
  return browserBrokerRequest(`${BASE_PATH}/runs`, { searchParams: params });
}
export function getMigrationRun(runId: string): Promise<BrokerSuccessResponse<TradingMigrationRun>> {
  return browserBrokerRequest(`${BASE_PATH}/runs/${runId}`);
}
export function startTradingMigration(input: StartTradingMigrationInput): Promise<BrokerSuccessResponse<StartTradingMigrationResult>> {
  return browserBrokerRequest(`${BASE_PATH}/runs`, { method: "POST", body: input });
}
