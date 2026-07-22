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
import {
  BONUS_ASSIGNMENT_STATUSES,
  DEPOSIT_BONUS_INTENT_STATUSES,
  bonusAssignmentStatusLabel,
  bonusAssignmentStatusVariant,
  depositBonusIntentStatusLabel,
  depositBonusIntentStatusVariant,
  formatDateTimeValue,
  formatMoneyValue,
  listBonusAssignments,
  listDepositBonusIntents,
  truncateId,
  type BonusAssignment,
  type BonusAssignmentStatus,
  type BonusLogsTab,
  type DepositBonusIntent,
  type DepositBonusIntentStatus,
} from "@/features/bonus-assignment-logs";
import { listBonusOffers } from "@/features/bonus-offer/api";
import type { BonusOffer } from "@/features/bonus-offer/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Bonus logs", current: true },
];

const logsTabs: { value: BonusLogsTab; label: string }[] = [
  { value: "assignments", label: "Assignments" },
  { value: "deposit-intents", label: "Deposit intents" },
];

export function BonusAssignmentLogsView() {
  const [activeTab, setActiveTab] = useState<BonusLogsTab>("assignments");

  const [bonusOffers, setBonusOffers] = useState<BonusOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const [assignments, setAssignments] = useState<BonusAssignment[]>([]);
  const [intents, setIntents] = useState<DepositBonusIntent[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [offerFilter, setOfferFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountIdInput, setAccountIdInput] = useState("");
  const [accountIdFilter, setAccountIdFilter] = useState("");
  const [externalUserIdInput, setExternalUserIdInput] = useState("");
  const [externalUserIdFilter, setExternalUserIdFilter] = useState("");

  const selectedOfferId = offerFilter === "all" ? undefined : offerFilter;
  const selectedAssignmentStatus =
    statusFilter === "all"
      ? undefined
      : (statusFilter as BonusAssignmentStatus);
  const selectedIntentStatus =
    statusFilter === "all"
      ? undefined
      : (statusFilter as DepositBonusIntentStatus);

  const loadBonusOffers = useCallback(async () => {
    setOffersLoading(true);

    try {
      const response = await listBonusOffers({ per_page: 100 });
      setBonusOffers(response.data);
    } catch {
      setBonusOffers([]);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  const loadAssignments = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listBonusAssignments({
          page: requestedPage,
          per_page: 15,
          bonus_offer_id: selectedOfferId,
          account_id: accountIdFilter || undefined,
          status: selectedAssignmentStatus,
        });

        setAssignments(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setAssignments([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [accountIdFilter, selectedAssignmentStatus, selectedOfferId],
  );

  const loadIntents = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listDepositBonusIntents({
          page: requestedPage,
          per_page: 15,
          account_id: accountIdFilter || undefined,
          external_user_id: externalUserIdFilter || undefined,
          status: selectedIntentStatus,
        });

        setIntents(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setIntents([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [accountIdFilter, externalUserIdFilter, selectedIntentStatus],
  );

  useEffect(() => {
    void loadBonusOffers();
  }, [loadBonusOffers]);

  useEffect(() => {
    setPage(1);
    setStatusFilter("all");
    setOfferFilter("all");
    setAccountIdInput("");
    setAccountIdFilter("");
    setExternalUserIdInput("");
    setExternalUserIdFilter("");
    setError(null);
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
  }, [
    offerFilter,
    statusFilter,
    accountIdFilter,
    externalUserIdFilter,
  ]);

  useEffect(() => {
    if (activeTab === "assignments") {
      void loadAssignments(page);
      return;
    }

    void loadIntents(page);
  }, [activeTab, loadAssignments, loadIntents, page]);

  function applyFilters() {
    setPage(1);
    setAccountIdFilter(accountIdInput.trim());
    setExternalUserIdFilter(externalUserIdInput.trim());
  }

  function clearFilters() {
    setOfferFilter("all");
    setStatusFilter("all");
    setAccountIdInput("");
    setAccountIdFilter("");
    setExternalUserIdInput("");
    setExternalUserIdFilter("");
    setPage(1);
  }

  function refresh() {
    if (activeTab === "assignments") {
      void loadAssignments(page);
      return;
    }

    void loadIntents(page);
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
        {logsTabs.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            variant={activeTab === tab.value ? "default" : "outline"}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
        {activeTab === "assignments" ? (
          <div className="space-y-2">
            <Label htmlFor="bonus-logs-offer">Bonus offer</Label>
            <Select
              value={offerFilter}
              onValueChange={setOfferFilter}
              disabled={offersLoading}
            >
              <SelectTrigger id="bonus-logs-offer" className="w-full">
                <SelectValue placeholder="All offers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All offers</SelectItem>
                {bonusOffers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {offer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="bonus-logs-status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="bonus-logs-status" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(activeTab === "assignments"
                ? BONUS_ASSIGNMENT_STATUSES
                : DEPOSIT_BONUS_INTENT_STATUSES
              ).map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bonus-logs-account-id">Account ID</Label>
          <Input
            id="bonus-logs-account-id"
            value={accountIdInput}
            onChange={(event) => setAccountIdInput(event.target.value)}
            placeholder="UUID"
          />
        </div>

        {activeTab === "deposit-intents" ? (
          <div className="space-y-2">
            <Label htmlFor="bonus-logs-external-user-id">External user ID</Label>
            <Input
              id="bonus-logs-external-user-id"
              value={externalUserIdInput}
              onChange={(event) => setExternalUserIdInput(event.target.value)}
              placeholder="User id"
            />
          </div>
        ) : null}

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
        <ApiErrorAlert
          title={
            activeTab === "assignments"
              ? "Could not load bonus assignments"
              : "Could not load deposit bonus intents"
          }
          message={error}
        />
      ) : null}

      {activeTab === "assignments" ? (
        <AssignmentsTable loading={loading} assignments={assignments} />
      ) : (
        <DepositIntentsTable loading={loading} intents={intents} />
      )}

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

function AssignmentsTable({
  loading,
  assignments,
}: {
  loading: boolean;
  assignments: BonusAssignment[];
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created</TableHead>
            <TableHead>Offer</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Credited</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Activated</TableHead>
            <TableHead>Conversion deadline</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Pending removal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`assignment-skeleton-${index}`}>
                  {Array.from({ length: 10 }).map((__, cellIndex) => (
                    <TableCell
                      key={`assignment-skeleton-${index}-${cellIndex}`}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!loading && assignments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground"
              >
                No bonus assignments found.
              </TableCell>
            </TableRow>
          ) : null}

          {!loading
            ? assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    {formatDateTimeValue(assignment.created_at)}
                  </TableCell>
                  <TableCell>
                    {assignment.bonus_offer?.name ??
                      truncateId(assignment.bonus_offer_id)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateId(assignment.account_id)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateId(assignment.external_user_id)}
                  </TableCell>
                  <TableCell>
                    {formatMoneyValue(assignment.credited_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={bonusAssignmentStatusVariant(assignment.status)}
                    >
                      {bonusAssignmentStatusLabel(assignment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDateTimeValue(assignment.activated_at)}
                  </TableCell>
                  <TableCell>
                    {formatDateTimeValue(assignment.conversion_deadline_at)}
                  </TableCell>
                  <TableCell>
                    {formatMoneyValue(assignment.accumulated_activity ?? null)}
                  </TableCell>
                  <TableCell>
                    {assignment.pending_removal ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}

function DepositIntentsTable({
  loading,
  intents,
}: {
  loading: boolean;
  intents: DepositBonusIntent[];
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignment</TableHead>
            <TableHead>Last evaluated</TableHead>
            <TableHead>Cancellation reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`intent-skeleton-${index}`}>
                  {Array.from({ length: 7 }).map((__, cellIndex) => (
                    <TableCell key={`intent-skeleton-${index}-${cellIndex}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!loading && intents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                No deposit bonus intents found.
              </TableCell>
            </TableRow>
          ) : null}

          {!loading
            ? intents.map((intent) => (
                <TableRow key={intent.id}>
                  <TableCell>
                    {formatDateTimeValue(intent.created_at)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateId(intent.account_id)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncateId(intent.external_user_id)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={depositBonusIntentStatusVariant(intent.status)}
                    >
                      {depositBonusIntentStatusLabel(intent.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {intent.bonus_assignment_id
                      ? truncateId(intent.bonus_assignment_id)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {formatDateTimeValue(intent.last_evaluated_at)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {intent.cancellation_reason ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}
