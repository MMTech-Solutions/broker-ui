"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, RefreshCwIcon, XIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
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
  AccountInsuranceApproveDialog,
  AccountInsuranceRejectDialog,
} from "@/features/insurance/components/account-insurance-claim-dialogs";
import {
  ACCOUNT_INSURANCE_STATUSES,
  accountInsuranceStatusLabel,
  accountInsuranceStatusVariant,
  approveAccountInsuranceClaim,
  formatDateTimeValue,
  formatMoneyValue,
  listAccountInsurancesAdmin,
  truncateId,
  type AccountInsurance,
  type AccountInsuranceStatus,
} from "@/features/insurance";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Account insurances", current: true },
];

export function AccountInsurancesAdminView() {
  const [assignments, setAssignments] = useState<AccountInsurance[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [accountIdInput, setAccountIdInput] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [optionIdInput, setOptionIdInput] = useState("");
  const [accountIdFilter, setAccountIdFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [optionIdFilter, setOptionIdFilter] = useState("");

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AccountInsurance | null>(null);

  const selectedStatus =
    statusFilter === "all" ? undefined : (statusFilter as AccountInsuranceStatus);

  const loadAssignments = useCallback(
    async (requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listAccountInsurancesAdmin({
          page: requestedPage,
          per_page: 15,
          status: selectedStatus,
          account_id: accountIdFilter || undefined,
          external_user_id: userIdFilter || undefined,
          insurance_plan_option_id: optionIdFilter || undefined,
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
    [accountIdFilter, optionIdFilter, selectedStatus, userIdFilter],
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter, accountIdFilter, userIdFilter, optionIdFilter]);

  useEffect(() => {
    void loadAssignments(page);
  }, [loadAssignments, page]);

  function applyFilters() {
    setAccountIdFilter(accountIdInput.trim());
    setUserIdFilter(userIdInput.trim());
    setOptionIdFilter(optionIdInput.trim());
  }

  function clearFilters() {
    setStatusFilter("all");
    setAccountIdInput("");
    setUserIdInput("");
    setOptionIdInput("");
    setAccountIdFilter("");
    setUserIdFilter("");
    setOptionIdFilter("");
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
          <Label htmlFor="account-insurances-status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="account-insurances-status" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ACCOUNT_INSURANCE_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-insurances-account-id">Account ID</Label>
          <Input
            id="account-insurances-account-id"
            value={accountIdInput}
            onChange={(event) => setAccountIdInput(event.target.value)}
            placeholder="UUID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-insurances-user-id">User ID</Label>
          <Input
            id="account-insurances-user-id"
            value={userIdInput}
            onChange={(event) => setUserIdInput(event.target.value)}
            placeholder="External user ID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-insurances-option-id">Plan option ID</Label>
          <Input
            id="account-insurances-option-id"
            value={optionIdInput}
            onChange={(event) => setOptionIdInput(event.target.value)}
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
          title="Could not load account insurances"
          message={error}
        />
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Insured</TableHead>
              <TableHead>Compensation</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-[96px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`insurance-skeleton-${index}`}>
                    {Array.from({ length: 9 }).map((__, cellIndex) => (
                      <TableCell key={`insurance-skeleton-${index}-${cellIndex}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && assignments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  No account insurances found.
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
                      {assignment.plan?.name ?? "—"}
                      {assignment.option ? (
                        <p className="text-xs text-muted-foreground">
                          {assignment.option.coverage_percentage}% ·{" "}
                          {assignment.option.duration_days}d
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {truncateId(assignment.account_id)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {truncateId(assignment.external_user_id)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={accountInsuranceStatusVariant(
                          assignment.status,
                        )}
                      >
                        {accountInsuranceStatusLabel(assignment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatMoneyValue(assignment.insured_amount)}
                    </TableCell>
                    <TableCell>
                      {formatMoneyValue(assignment.compensation_amount ?? null)}
                    </TableCell>
                    <TableCell>
                      {formatDateTimeValue(assignment.expires_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {assignment.status === "pending_claim" ? (
                        <div className="flex justify-end gap-1">
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip="Approve claim"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setApproveOpen(true);
                            }}
                          >
                            <CheckIcon />
                          </ActionTooltipButton>
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip="Reject claim"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setRejectOpen(true);
                            }}
                          >
                            <XIcon />
                          </ActionTooltipButton>
                        </div>
                      ) : (
                        "—"
                      )}
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

      <AccountInsuranceApproveDialog
        accountInsurance={selectedAssignment}
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onApprove={approveAccountInsuranceClaim}
        onSuccess={() => void loadAssignments(page)}
      />

      <AccountInsuranceRejectDialog
        accountInsurance={selectedAssignment}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSuccess={() => void loadAssignments(page)}
      />
    </div>
  );
}
