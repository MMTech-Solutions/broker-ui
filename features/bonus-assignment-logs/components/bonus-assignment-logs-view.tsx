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
  bonusAssignmentStatusLabel,
  bonusAssignmentStatusVariant,
  formatDateTimeValue,
  formatMoneyValue,
  listBonusAssignments,
  truncateId,
  type BonusAssignment,
  type BonusAssignmentStatus,
} from "@/features/bonus-assignment-logs";
import { listBonusOffers } from "@/features/bonus-offer/api";
import type { BonusOffer } from "@/features/bonus-offer/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Bonus assignment logs", current: true },
];

export function BonusAssignmentLogsView() {
  const [bonusOffers, setBonusOffers] = useState<BonusOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const [assignments, setAssignments] = useState<BonusAssignment[]>([]);
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

  const selectedOfferId = offerFilter === "all" ? undefined : offerFilter;
  const selectedStatus =
    statusFilter === "all" ? undefined : (statusFilter as BonusAssignmentStatus);

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
          status: selectedStatus,
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
    [accountIdFilter, selectedOfferId, selectedStatus],
  );

  useEffect(() => {
    void loadBonusOffers();
  }, [loadBonusOffers]);

  useEffect(() => {
    setPage(1);
  }, [offerFilter, statusFilter, accountIdFilter]);

  useEffect(() => {
    void loadAssignments(page);
  }, [loadAssignments, page]);

  function applyFilters() {
    setPage(1);
    setAccountIdFilter(accountIdInput.trim());
  }

  function clearFilters() {
    setOfferFilter("all");
    setStatusFilter("all");
    setAccountIdInput("");
    setAccountIdFilter("");
    setPage(1);
  }

  function refresh() {
    void loadAssignments(page);
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

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="bonus-assignment-logs-offer">Bonus offer</Label>
          <Select
            value={offerFilter}
            onValueChange={setOfferFilter}
            disabled={offersLoading}
          >
            <SelectTrigger id="bonus-assignment-logs-offer" className="w-full">
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

        <div className="space-y-2">
          <Label htmlFor="bonus-assignment-logs-status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="bonus-assignment-logs-status" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {BONUS_ASSIGNMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bonus-assignment-logs-account-id">Account ID</Label>
          <Input
            id="bonus-assignment-logs-account-id"
            value={accountIdInput}
            onChange={(event) => setAccountIdInput(event.target.value)}
            placeholder="UUID"
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
        <ApiErrorAlert
          title="Could not load bonus assignment logs"
          message={error}
        />
      ) : null}

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
                        variant={bonusAssignmentStatusVariant(
                          assignment.status,
                        )}
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
