"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BanIcon,
  ClipboardListIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SettingsIcon,
  Trash2Icon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { listContests } from "@/features/contest/api";
import { ContestAssignedConditionsDialog } from "@/features/contest/components/contest-assigned-conditions-dialog";
import { ContestAssignedAwardsDialog } from "@/features/contest/components/contest-assigned-awards-dialog";
import { ContestDeleteDialog } from "@/features/contest/components/contest-delete-dialog";
import { ContestFormDialog } from "@/features/contest/components/contest-form-dialog";
import { ContestLifecycleDialog } from "@/features/contest/components/contest-lifecycle-dialog";
import {
  formatContestDateRange,
  formatMinorUnits,
  getContestStatusBadgeVariant,
} from "@/features/contest/format";
import {
  CONTEST_STATUSES,
  type Contest,
  type ContestStatus,
} from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const contestsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Contests", current: true },
];

const ALL_STATUSES_VALUE = "__all__";

const statusLabels = Object.fromEntries(
  CONTEST_STATUSES.map((option) => [option.value, option.label]),
) as Record<string, string>;

export function ContestsView() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [appliedNameFilter, setAppliedNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContestStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [contestToDelete, setContestToDelete] = useState<Contest | null>(null);

  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [lifecycleAction, setLifecycleAction] = useState<
    "activate" | "cancel" | null
  >(null);
  const [contestForLifecycle, setContestForLifecycle] =
    useState<Contest | null>(null);

  const [awardsOpen, setAwardsOpen] = useState(false);
  const [contestForAwards, setContestForAwards] = useState<Contest | null>(
    null,
  );

  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [contestForConditions, setContestForConditions] =
    useState<Contest | null>(null);

  const loadContests = useCallback(
    async (requestedPage: number, name?: string, status?: ContestStatus) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listContests({
          page: requestedPage,
          per_page: 15,
          ...(name ? { name } : {}),
          ...(status ? { status } : {}),
        });

        setContests(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setContests([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadContests(
      page,
      appliedNameFilter || undefined,
      statusFilter || undefined,
    );
  }, [loadContests, page, appliedNameFilter, statusFilter]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedNameFilter(nameFilter.trim());
  }

  function openCreateDialog() {
    setFormMode("create");
    setSelectedContest(null);
    setFormOpen(true);
  }

  function openEditDialog(contest: Contest) {
    setFormMode("edit");
    setSelectedContest(contest);
    setFormOpen(true);
  }

  function openDeleteDialog(contest: Contest) {
    setContestToDelete(contest);
    setDeleteOpen(true);
  }

  function openLifecycleDialog(
    contest: Contest,
    action: "activate" | "cancel",
  ) {
    setContestForLifecycle(contest);
    setLifecycleAction(action);
    setLifecycleOpen(true);
  }

  function openAwardsDialog(contest: Contest) {
    setContestForAwards(contest);
    setAwardsOpen(true);
  }

  function openConditionsDialog(contest: Contest) {
    setContestForConditions(contest);
    setConditionsOpen(true);
  }

  function handleMutationSuccess() {
    void loadContests(
      page,
      appliedNameFilter || undefined,
      statusFilter || undefined,
    );
  }

  function canActivate(contest: Contest): boolean {
    return contest.status === "draft";
  }

  function canCancel(contest: Contest): boolean {
    return contest.status === "draft" || contest.status === "upcoming";
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={contestsBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button variant="outline" render={<Link href="/contest-conditions" />}>
          <ClipboardListIcon />
          Condition library
        </Button>
        <Button variant="outline" render={<Link href="/contest-awards" />}>
          <TrophyIcon />
          Award library
        </Button>
        <Button variant="outline" render={<Link href="/contest-settings" />}>
          <SettingsIcon />
          Global settings
        </Button>
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New contest
        </Button>
      </PageContentToolbar>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={handleSearchSubmit}
      >
        <div className="min-w-[220px] flex-1 space-y-1">
          <label
            htmlFor="contest-name-filter"
            className="text-sm text-muted-foreground"
          >
            Name
          </label>
          <Input
            id="contest-name-filter"
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Search by name"
          />
        </div>

        <div className="min-w-[180px] space-y-1">
          <label
            htmlFor="contest-status-filter"
            className="text-sm text-muted-foreground"
          >
            Status
          </label>
          <Select
            value={statusFilter || ALL_STATUSES_VALUE}
            onValueChange={(value) => {
              setPage(1);
              setStatusFilter(
                value === ALL_STATUSES_VALUE ? "" : (value as ContestStatus),
              );
            }}
          >
            <SelectTrigger id="contest-status-filter" className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES_VALUE}>All statuses</SelectItem>
              {CONTEST_STATUSES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {error ? (
        <ApiErrorAlert title="Could not load contests" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Server group</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Entry fee</TableHead>
              <TableHead>Subs / Awards</TableHead>
              <TableHead className="w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && contests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No contests found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? contests.map((contest) => (
                  <TableRow key={contest.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{contest.name}</span>
                        {contest.is_protected ? (
                          <Badge variant="outline">Protected</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getContestStatusBadgeVariant(contest.status)}>
                        {statusLabels[contest.status] ?? contest.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {contest.server_group?.name ?? contest.server_group_id}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {formatContestDateRange(
                        contest.starts_at,
                        contest.ends_at,
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMinorUnits(
                        contest.entry_fee,
                        contest.server_group?.currency,
                        contest.server_group?.currency_precision,
                      )}
                    </TableCell>
                    <TableCell>
                      {contest.subscriptions_count ?? 0} /{" "}
                      {contest.awards_count ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canActivate(contest) ? (
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip={`Activate ${contest.name}`}
                            onClick={() =>
                              openLifecycleDialog(contest, "activate")
                            }
                          >
                            <PlayIcon />
                          </ActionTooltipButton>
                        ) : null}
                        {canCancel(contest) ? (
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip={`Cancel ${contest.name}`}
                            onClick={() =>
                              openLifecycleDialog(contest, "cancel")
                            }
                          >
                            <BanIcon />
                          </ActionTooltipButton>
                        ) : null}
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`View subscriptions for ${contest.name}`}
                          render={
                            <Link
                              href={`/contest-subscriptions?contestId=${contest.id}`}
                            />
                          }
                        >
                          <UsersIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Manage awards for ${contest.name}`}
                          onClick={() => openAwardsDialog(contest)}
                        >
                          <TrophyIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Manage conditions for ${contest.name}`}
                          onClick={() => openConditionsDialog(contest)}
                        >
                          <ClipboardListIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${contest.name}`}
                          onClick={() => openEditDialog(contest)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${contest.name}`}
                          onClick={() => openDeleteDialog(contest)}
                        >
                          <Trash2Icon />
                        </ActionTooltipButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.last_page > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page} (
            {pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.last_page || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.last_page, current + 1),
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <ContestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        contest={selectedContest}
        onSuccess={handleMutationSuccess}
      />

      <ContestDeleteDialog
        contest={contestToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />

      <ContestLifecycleDialog
        contest={contestForLifecycle}
        action={lifecycleAction}
        open={lifecycleOpen}
        onOpenChange={setLifecycleOpen}
        onSuccess={handleMutationSuccess}
      />

      <ContestAssignedAwardsDialog
        contest={contestForAwards}
        open={awardsOpen}
        onOpenChange={setAwardsOpen}
        onSuccess={handleMutationSuccess}
      />

      <ContestAssignedConditionsDialog
        contest={contestForConditions}
        open={conditionsOpen}
        onOpenChange={setConditionsOpen}
      />
    </div>
  );
}
