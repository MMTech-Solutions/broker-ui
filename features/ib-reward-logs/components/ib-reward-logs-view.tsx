"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listIbPrograms } from "@/features/ib-program/api";
import type { IbProgram } from "@/features/ib-program/types";
import {
  IB_PAYMENT_RULE_TYPES,
  IB_REWARD_LOG_TABS,
  formatDateTimeValue,
  formatMoneyValue,
  listIbRewardSettlementRuns,
  listIbTradingAccountPeriodSnapshots,
  paymentRuleTypeLabel,
  type IbRewardLogTab,
  type IbRewardSettlementRun,
  type IbTradingAccountPeriodSnapshot,
} from "@/features/ib-reward-logs";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "IB Reward logs", current: true },
];

const tabLabels: Record<IbRewardLogTab, string> = {
  "period-snapshots": "Period snapshots",
  "settlement-runs": "Settlement runs",
};

type FailedFilter = "all" | "failed" | "successful";

function isRewardLogTab(value: string | null): value is IbRewardLogTab {
  return IB_REWARD_LOG_TABS.includes(value as IbRewardLogTab);
}

function truncateId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

export function IbRewardLogsView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = useMemo<IbRewardLogTab>(() => {
    const tab = searchParams.get("tab");

    return isRewardLogTab(tab) ? tab : "period-snapshots";
  }, [searchParams]);

  const [programs, setPrograms] = useState<IbProgram[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  const [periodSnapshots, setPeriodSnapshots] = useState<
    IbTradingAccountPeriodSnapshot[]
  >([]);
  const [settlementRuns, setSettlementRuns] = useState<IbRewardSettlementRun[]>(
    [],
  );
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [programFilter, setProgramFilter] = useState("all");
  const [accountIdInput, setAccountIdInput] = useState("");
  const [accountIdFilter, setAccountIdFilter] = useState("");
  const [settlementRunIdInput, setSettlementRunIdInput] = useState("");
  const [settlementRunIdFilter, setSettlementRunIdFilter] = useState("");
  const [createdAtFrom, setCreatedAtFrom] = useState("");
  const [createdAtTo, setCreatedAtTo] = useState("");

  const [paymentRuleTypeFilter, setPaymentRuleTypeFilter] = useState("all");
  const [failedFilter, setFailedFilter] = useState<FailedFilter>("all");
  const [startedAtFrom, setStartedAtFrom] = useState("");
  const [startedAtTo, setStartedAtTo] = useState("");

  const selectedProgramId =
    programFilter === "all" ? undefined : programFilter;

  const loadPrograms = useCallback(async () => {
    setProgramsLoading(true);

    try {
      const response = await listIbPrograms({ per_page: 100 });
      setPrograms(response.data);
    } catch {
      setPrograms([]);
    } finally {
      setProgramsLoading(false);
    }
  }, []);

  const loadPeriodSnapshots = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listIbTradingAccountPeriodSnapshots({
          page: requestedPage,
          per_page: 15,
          ib_program_id: selectedProgramId,
          account_id: accountIdFilter || undefined,
          settlement_run_id: settlementRunIdFilter || undefined,
          created_at_from: createdAtFrom || undefined,
          created_at_to: createdAtTo || undefined,
        });

        setPeriodSnapshots(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setPeriodSnapshots([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [
      selectedProgramId,
      accountIdFilter,
      settlementRunIdFilter,
      createdAtFrom,
      createdAtTo,
    ],
  );

  const loadSettlementRuns = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listIbRewardSettlementRuns({
          page: requestedPage,
          per_page: 15,
          ib_program_id: selectedProgramId,
          payment_rule_type:
            paymentRuleTypeFilter === "all"
              ? undefined
              : paymentRuleTypeFilter,
          is_failed:
            failedFilter === "all"
              ? undefined
              : failedFilter === "failed",
          started_at_from: startedAtFrom || undefined,
          started_at_to: startedAtTo || undefined,
        });

        setSettlementRuns(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setSettlementRuns([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [
      selectedProgramId,
      paymentRuleTypeFilter,
      failedFilter,
      startedAtFrom,
      startedAtTo,
    ],
  );

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    if (activeTab === "period-snapshots") {
      void loadPeriodSnapshots(page);
      return;
    }

    void loadSettlementRuns(page);
  }, [activeTab, page, loadPeriodSnapshots, loadSettlementRuns]);

  function switchTab(tab: IbRewardLogTab) {
    setPage(1);
    setError(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/ib-reward-logs?${params.toString()}`);
  }

  function applyFilters() {
    setPage(1);

    if (activeTab === "period-snapshots") {
      setAccountIdFilter(accountIdInput.trim());
      setSettlementRunIdFilter(settlementRunIdInput.trim());
      return;
    }

    setAccountIdFilter("");
    setSettlementRunIdFilter("");
  }

  function clearFilters() {
    setProgramFilter("all");
    setAccountIdInput("");
    setAccountIdFilter("");
    setSettlementRunIdInput("");
    setSettlementRunIdFilter("");
    setCreatedAtFrom("");
    setCreatedAtTo("");
    setPaymentRuleTypeFilter("all");
    setFailedFilter("all");
    setStartedAtFrom("");
    setStartedAtTo("");
    setPage(1);
  }

  function refresh() {
    if (activeTab === "period-snapshots") {
      void loadPeriodSnapshots(page);
      return;
    }

    void loadSettlementRuns(page);
  }

  const totalPages = pagination?.last_page ?? 1;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCwIcon className={cn(loading && "animate-spin")} />
          Refresh
        </Button>
      </PageContentToolbar>

      <div className="flex flex-wrap gap-2">
        {IB_REWARD_LOG_TABS.map((tab) => (
          <Button
            key={tab}
            type="button"
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => switchTab(tab)}
          >
            {tabLabels[tab]}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="ib-reward-logs-program">IB program</Label>
          <Select
            value={programFilter}
            onValueChange={setProgramFilter}
            disabled={programsLoading}
          >
            <SelectTrigger id="ib-reward-logs-program" className="w-full">
              <SelectValue placeholder="All programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All programs</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeTab === "period-snapshots" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="ib-reward-logs-account-id">Account ID</Label>
              <Input
                id="ib-reward-logs-account-id"
                value={accountIdInput}
                onChange={(event) => setAccountIdInput(event.target.value)}
                placeholder="UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-reward-logs-settlement-run-id">
                Settlement run ID
              </Label>
              <Input
                id="ib-reward-logs-settlement-run-id"
                value={settlementRunIdInput}
                onChange={(event) =>
                  setSettlementRunIdInput(event.target.value)
                }
                placeholder="UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-reward-logs-created-from">Created from</Label>
              <Input
                id="ib-reward-logs-created-from"
                type="datetime-local"
                value={createdAtFrom}
                onChange={(event) => setCreatedAtFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-reward-logs-created-to">Created to</Label>
              <Input
                id="ib-reward-logs-created-to"
                type="datetime-local"
                value={createdAtTo}
                onChange={(event) => setCreatedAtTo(event.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="ib-reward-logs-rule-type">Payment rule type</Label>
              <Select
                value={paymentRuleTypeFilter}
                onValueChange={setPaymentRuleTypeFilter}
              >
                <SelectTrigger id="ib-reward-logs-rule-type" className="w-full">
                  <SelectValue placeholder="All rule types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All rule types</SelectItem>
                  {IB_PAYMENT_RULE_TYPES.map((ruleType) => (
                    <SelectItem key={ruleType} value={ruleType}>
                      {paymentRuleTypeLabel(ruleType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-reward-logs-failed-filter">Run status</Label>
              <Select
                value={failedFilter}
                onValueChange={(value) =>
                  setFailedFilter(value as FailedFilter)
                }
              >
                <SelectTrigger id="ib-reward-logs-failed-filter" className="w-full">
                  <SelectValue placeholder="All runs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All runs</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-reward-logs-started-from">Started from</Label>
              <Input
                id="ib-reward-logs-started-from"
                type="datetime-local"
                value={startedAtFrom}
                onChange={(event) => setStartedAtFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ib-reward-logs-started-to">Started to</Label>
              <Input
                id="ib-reward-logs-started-to"
                type="datetime-local"
                value={startedAtTo}
                onChange={(event) => setStartedAtTo(event.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
          <Button type="button" onClick={applyFilters}>
            Apply filters
          </Button>
          <Button type="button" variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      {error ? <ApiErrorAlert title="Could not load IB reward logs" message={error} /> : null}

      <div className="rounded-lg border">
        {activeTab === "period-snapshots" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Settlement run</TableHead>
                <TableHead>Balance before</TableHead>
                <TableHead>Balance after</TableHead>
                <TableHead>Deposits</TableHead>
                <TableHead>Withdrawals</TableHead>
                <TableHead>D/W net</TableHead>
                <TableHead>nPnL</TableHead>
                <TableHead>Levels</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`snapshot-skeleton-${index}`}>
                      {Array.from({ length: 11 }).map((__, cellIndex) => (
                        <TableCell key={`snapshot-skeleton-${index}-${cellIndex}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!loading && periodSnapshots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground">
                    No period snapshots found.
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading
                ? periodSnapshots.map((snapshot) => (
                    <TableRow key={snapshot.id}>
                      <TableCell>
                        {formatDateTimeValue(snapshot.created_at)}
                      </TableCell>
                      <TableCell>
                        {snapshot.program?.name ?? truncateId(snapshot.ib_program_id)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {truncateId(snapshot.account_id)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {snapshot.settlement_run_id
                          ? truncateId(snapshot.settlement_run_id)
                          : "—"}
                      </TableCell>
                      <TableCell>{formatMoneyValue(snapshot.balance_before)}</TableCell>
                      <TableCell>{formatMoneyValue(snapshot.balance_after)}</TableCell>
                      <TableCell>{formatMoneyValue(snapshot.deposits)}</TableCell>
                      <TableCell>{formatMoneyValue(snapshot.withdrawals)}</TableCell>
                      <TableCell>{formatMoneyValue(snapshot.dw_net)}</TableCell>
                      <TableCell>{formatMoneyValue(snapshot.npnl)}</TableCell>
                      <TableCell>{snapshot.distribution_levels}</TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>Finished</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Rule type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rewards</TableHead>
                <TableHead>Total amount</TableHead>
                <TableHead>Failure reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`run-skeleton-${index}`}>
                      {Array.from({ length: 8 }).map((__, cellIndex) => (
                        <TableCell key={`run-skeleton-${index}-${cellIndex}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!loading && settlementRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No settlement runs found.
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading
                ? settlementRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>{formatDateTimeValue(run.started_at)}</TableCell>
                      <TableCell>{formatDateTimeValue(run.finished_at)}</TableCell>
                      <TableCell>
                        {run.program?.name ?? truncateId(run.ib_program_id)}
                      </TableCell>
                      <TableCell>
                        {paymentRuleTypeLabel(run.payment_rule_type)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={run.is_failed ? "destructive" : "secondary"}>
                          {run.is_failed ? "Failed" : "Successful"}
                        </Badge>
                      </TableCell>
                      <TableCell>{run.rewards_count}</TableCell>
                      <TableCell>{formatMoneyValue(run.total_amount)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {run.failure_reason ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Page {pagination?.current_page ?? page} of {totalPages}
          {pagination?.total != null ? ` · ${pagination.total} records` : ""}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
