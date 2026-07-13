"use client";

import { useCallback, useEffect, useState } from "react";
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
  IB_REWARD_PAYMENT_STATUSES,
  IB_REWARD_SOURCE_TYPES,
  formatDateTimeValue,
  formatMoneyValue,
  listIbRewards,
  paymentRuleTypeLabel,
  paymentStatusLabel,
  paymentStatusVariant,
  sourceTypeLabel,
  type IbReward,
} from "@/features/ib-reward";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "IB Rewards", current: true },
];

function truncateId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

export function IbRewardsView() {
  const [programs, setPrograms] = useState<IbProgram[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  const [rewards, setRewards] = useState<IbReward[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [programFilter, setProgramFilter] = useState("all");
  const [paymentRuleTypeFilter, setPaymentRuleTypeFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("all");
  const [benefactorIdInput, setBenefactorIdInput] = useState("");
  const [beneficiaryIdInput, setBeneficiaryIdInput] = useState("");
  const [settlementRunIdInput, setSettlementRunIdInput] = useState("");
  const [benefactorIdFilter, setBenefactorIdFilter] = useState("");
  const [beneficiaryIdFilter, setBeneficiaryIdFilter] = useState("");
  const [settlementRunIdFilter, setSettlementRunIdFilter] = useState("");
  const [createdAtFrom, setCreatedAtFrom] = useState("");
  const [createdAtTo, setCreatedAtTo] = useState("");

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

  const loadRewards = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listIbRewards({
          page: requestedPage,
          per_page: 15,
          ib_program_id: selectedProgramId,
          settlement_run_id: settlementRunIdFilter || undefined,
          benefactor_id: benefactorIdFilter || undefined,
          beneficiary_id: beneficiaryIdFilter || undefined,
          payment_rule_type:
            paymentRuleTypeFilter === "all"
              ? undefined
              : paymentRuleTypeFilter,
          payment_status:
            paymentStatusFilter === "all" ? undefined : paymentStatusFilter,
          source_type:
            sourceTypeFilter === "all" ? undefined : sourceTypeFilter,
          created_at_from: createdAtFrom || undefined,
          created_at_to: createdAtTo || undefined,
        });

        setRewards(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setRewards([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [
      selectedProgramId,
      settlementRunIdFilter,
      benefactorIdFilter,
      beneficiaryIdFilter,
      paymentRuleTypeFilter,
      paymentStatusFilter,
      sourceTypeFilter,
      createdAtFrom,
      createdAtTo,
    ],
  );

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    void loadRewards(page);
  }, [loadRewards, page]);

  function applyFilters() {
    setPage(1);
    setBenefactorIdFilter(benefactorIdInput.trim());
    setBeneficiaryIdFilter(beneficiaryIdInput.trim());
    setSettlementRunIdFilter(settlementRunIdInput.trim());
  }

  function clearFilters() {
    setProgramFilter("all");
    setPaymentRuleTypeFilter("all");
    setPaymentStatusFilter("all");
    setSourceTypeFilter("all");
    setBenefactorIdInput("");
    setBeneficiaryIdInput("");
    setSettlementRunIdInput("");
    setBenefactorIdFilter("");
    setBeneficiaryIdFilter("");
    setSettlementRunIdFilter("");
    setCreatedAtFrom("");
    setCreatedAtTo("");
    setPage(1);
  }

  const totalPages = pagination?.last_page ?? 1;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadRewards(page)}
          disabled={loading}
        >
          <RefreshCwIcon className={cn(loading && "animate-spin")} />
          Refresh
        </Button>
      </PageContentToolbar>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="ib-rewards-program">IB program</Label>
          <Select
            value={programFilter}
            onValueChange={setProgramFilter}
            disabled={programsLoading}
          >
            <SelectTrigger id="ib-rewards-program" className="w-full">
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

        <div className="space-y-2">
          <Label htmlFor="ib-rewards-rule-type">Payment rule type</Label>
          <Select
            value={paymentRuleTypeFilter}
            onValueChange={setPaymentRuleTypeFilter}
          >
            <SelectTrigger id="ib-rewards-rule-type" className="w-full">
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
          <Label htmlFor="ib-rewards-payment-status">Payment status</Label>
          <Select
            value={paymentStatusFilter}
            onValueChange={setPaymentStatusFilter}
          >
            <SelectTrigger id="ib-rewards-payment-status" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {IB_REWARD_PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {paymentStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ib-rewards-source-type">Source type</Label>
          <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
            <SelectTrigger id="ib-rewards-source-type" className="w-full">
              <SelectValue placeholder="All source types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All source types</SelectItem>
              {IB_REWARD_SOURCE_TYPES.map((sourceType) => (
                <SelectItem key={sourceType} value={sourceType}>
                  {sourceTypeLabel(sourceType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ib-rewards-benefactor-id">Benefactor ID</Label>
          <Input
            id="ib-rewards-benefactor-id"
            value={benefactorIdInput}
            onChange={(event) => setBenefactorIdInput(event.target.value)}
            placeholder="External user ID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ib-rewards-beneficiary-id">Beneficiary ID</Label>
          <Input
            id="ib-rewards-beneficiary-id"
            value={beneficiaryIdInput}
            onChange={(event) => setBeneficiaryIdInput(event.target.value)}
            placeholder="External user ID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ib-rewards-settlement-run-id">Settlement run ID</Label>
          <Input
            id="ib-rewards-settlement-run-id"
            value={settlementRunIdInput}
            onChange={(event) => setSettlementRunIdInput(event.target.value)}
            placeholder="UUID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ib-rewards-created-from">Created from</Label>
          <Input
            id="ib-rewards-created-from"
            type="datetime-local"
            value={createdAtFrom}
            onChange={(event) => setCreatedAtFrom(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ib-rewards-created-to">Created to</Label>
          <Input
            id="ib-rewards-created-to"
            type="datetime-local"
            value={createdAtTo}
            onChange={(event) => setCreatedAtTo(event.target.value)}
          />
        </div>

        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
          <Button type="button" onClick={applyFilters}>
            Apply filters
          </Button>
          <Button type="button" variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      {error ? (
        <ApiErrorAlert title="Could not load IB rewards" message={error} />
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Benefactor</TableHead>
              <TableHead>Beneficiary</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Settlement run</TableHead>
              <TableHead>Ext. txn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`reward-skeleton-${index}`}>
                    {Array.from({ length: 11 }).map((__, cellIndex) => (
                      <TableCell key={`reward-skeleton-${index}-${cellIndex}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && rewards.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-muted-foreground"
                >
                  No IB rewards found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      {formatDateTimeValue(reward.created_at)}
                    </TableCell>
                    <TableCell>
                      {reward.program?.name ??
                        truncateId(reward.ib_program_id)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {truncateId(reward.benefactor_id)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {truncateId(reward.beneficiary_id)}
                    </TableCell>
                    <TableCell>
                      {paymentRuleTypeLabel(reward.payment_rule_type)}
                    </TableCell>
                    <TableCell>{reward.distribution_level}</TableCell>
                    <TableCell>{formatMoneyValue(reward.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariant(reward.payment_status)}>
                        {paymentStatusLabel(reward.payment_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span>{sourceTypeLabel(reward.source_type)}</span>
                        <p className="font-mono text-xs text-muted-foreground">
                          {truncateId(reward.source_id)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {reward.settlement_run_id
                        ? truncateId(reward.settlement_run_id)
                        : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {reward.external_transaction_id
                        ? truncateId(reward.external_transaction_id)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
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
