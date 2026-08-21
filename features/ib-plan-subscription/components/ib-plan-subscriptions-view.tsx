"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowRightLeftIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  BarChart3Icon,
  CheckIcon,
  EyeIcon,
  FilterXIcon,
  PencilIcon,
  MoreHorizontalIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { listIbPlanPrograms, listIbPlans } from "@/features/ib-plan/api";
import type { IbPlan, IbPlanProgram } from "@/features/ib-plan/types";
import {
  EMPTY_IB_PLAN_SUBSCRIPTION_FILTERS,
  IB_PLAN_SUBSCRIPTION_STATUSES,
  listIbPlanSubscriptions,
  resolveSubscriptionOwner,
  resolveSubscriptionProgramName,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
  type IbPlanSubscription,
  type IbPlanSubscriptionFilterFormState,
  type IbPlanSubscriptionListFilters,
  type IbPlanSubscriptionSortBy,
  type IbPlanSubscriptionSortDirection,
} from "@/features/ib-plan-subscription";
import { IbPlanSubscriptionDetailDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-detail-dialog";
import { IbPlanSubscriptionFormDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-form-dialog";
import { IbPlanSubscriptionParametersDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-parameters-dialog";
import { IbPlanSubscriptionPlacementDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-placement-dialog";
import { IbPlanSubscriptionReviewDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-review-dialog";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

type IbPlanSubscriptionsViewProps = {
  ibPlanId?: string;
};

const TABLE_COLUMN_COUNT = 9;

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formToAppliedFilters(
  form: IbPlanSubscriptionFilterFormState,
  sortBy: IbPlanSubscriptionSortBy,
  sortDirection: IbPlanSubscriptionSortDirection,
): IbPlanSubscriptionListFilters {
  const filters: IbPlanSubscriptionListFilters = {
    sort_by: sortBy,
    sort_direction: sortDirection,
  };

  const userId = form.user_id.trim();
  const userName = form.user_name.trim();
  const userEmail = form.user_email.trim();
  const comments = form.comments.trim();
  const programId = form.ib_program_id.trim();
  const programName = form.ib_program_name.trim();

  if (userId) {
    filters.user_id = userId;
  }

  if (userName) {
    filters.user_name = userName;
  }

  if (userEmail) {
    filters.user_email = userEmail;
  }

  if (
    form.status === "pending" ||
    form.status === "active" ||
    form.status === "denied"
  ) {
    filters.status = form.status;
  }

  if (programId && programId !== "all") {
    filters.ib_program_id = programId;
  }

  if (programName) {
    filters.ib_program_name = programName;
  }

  const personalRate = parseOptionalNumber(form.personal_rate);
  if (personalRate !== undefined) {
    filters.personal_rate = personalRate;
  }

  if (form.is_master === "true" || form.is_master === "false") {
    filters.is_master = form.is_master === "true";
  }

  if (comments) {
    filters.comments = comments;
  }

  return filters;
}

function abbreviateUuid(value: string): string {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}…`;
}

type ColumnSortHeadProps = {
  label: string;
  sortKey: IbPlanSubscriptionSortBy;
  activeSortBy: IbPlanSubscriptionSortBy;
  activeDirection: IbPlanSubscriptionSortDirection;
  onSort: (sortKey: IbPlanSubscriptionSortBy) => void;
  disabled?: boolean;
  className?: string;
  align?: "left" | "right";
};

function ColumnSortHead({
  label,
  sortKey,
  activeSortBy,
  activeDirection,
  onSort,
  disabled,
  className,
  align = "left",
}: ColumnSortHeadProps) {
  const isActive = activeSortBy === sortKey;

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        align === "right" && "justify-end",
        className,
      )}
    >
      <span className="text-xs font-medium">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-6 shrink-0"
        disabled={disabled}
        title={
          isActive
            ? `Sorted ${activeDirection === "asc" ? "ascending" : "descending"} — click to toggle`
            : `Sort by ${label}`
        }
        onClick={() => onSort(sortKey)}
      >
        {isActive ? (
          activeDirection === "asc" ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )
        ) : (
          <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

export function IbPlanSubscriptionsView({
  ibPlanId: fixedIbPlanId,
}: IbPlanSubscriptionsViewProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<IbPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(!fixedIbPlanId);
  const [selectedPlanId, setSelectedPlanId] = useState(fixedIbPlanId ?? "");
  const [selectedPlan, setSelectedPlan] = useState<IbPlan | null>(null);
  const [programOptions, setProgramOptions] = useState<IbPlanProgram[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);

  const [subscriptions, setSubscriptions] = useState<IbPlanSubscription[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draftFilters, setDraftFilters] =
    useState<IbPlanSubscriptionFilterFormState>(
      EMPTY_IB_PLAN_SUBSCRIPTION_FILTERS,
    );
  const [sortBy, setSortBy] = useState<IbPlanSubscriptionSortBy>("created_at");
  const [sortDirection, setSortDirection] =
    useState<IbPlanSubscriptionSortDirection>("desc");
  const [appliedFilters, setAppliedFilters] =
    useState<IbPlanSubscriptionListFilters>(
      formToAppliedFilters(
        EMPTY_IB_PLAN_SUBSCRIPTION_FILTERS,
        "created_at",
        "desc",
      ),
    );

  const [selectedSubscription, setSelectedSubscription] =
    useState<IbPlanSubscription | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState<"approve" | "reject">("approve");
  const [placementOpen, setPlacementOpen] = useState(false);
  const [parametersOpen, setParametersOpen] = useState(false);

  const activePlanId = fixedIbPlanId ?? selectedPlanId;

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    if (fixedIbPlanId) {
      return [
        { label: "Dashboard", href: "/" },
        { label: "IB Plans", href: "/ib-plans" },
        {
          label: selectedPlan?.name ?? "Plan subscriptions",
          current: true,
        },
      ];
    }

    return [
      { label: "Dashboard", href: "/" },
      { label: "IB Subscriptions", current: true },
    ];
  }, [fixedIbPlanId, selectedPlan?.name]);

  const loadPlans = useCallback(async () => {
    if (fixedIbPlanId) {
      setPlansLoading(true);

      try {
        const response = await listIbPlans({ per_page: 100 });
        const plan = response.data.find((item) => item.id === fixedIbPlanId);
        setSelectedPlan(plan ?? null);
      } catch {
        setSelectedPlan(null);
      } finally {
        setPlansLoading(false);
      }

      return;
    }

    setPlansLoading(true);
    setError(null);

    try {
      const response = await listIbPlans({ per_page: 100 });
      setPlans(response.data);

      if (response.data.length > 0) {
        setSelectedPlanId((current) => current || response.data[0].id);
      }
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, [fixedIbPlanId]);

  const loadPrograms = useCallback(async (planId: string) => {
    if (!planId) {
      setProgramOptions([]);
      return;
    }

    setProgramsLoading(true);

    try {
      const response = await listIbPlanPrograms(planId);
      setProgramOptions(response.data.programs);
    } catch {
      setProgramOptions([]);
    } finally {
      setProgramsLoading(false);
    }
  }, []);

  const loadSubscriptions = useCallback(
    async (requestedPage: number, filters: IbPlanSubscriptionListFilters) => {
      if (!activePlanId) {
        setSubscriptions([]);
        setPagination(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await listIbPlanSubscriptions(activePlanId, {
          ...filters,
          page: requestedPage,
          per_page: 15,
        });

        setSubscriptions(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setSubscriptions([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [activePlanId],
  );

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (!fixedIbPlanId) {
      setSelectedPlan(plans.find((plan) => plan.id === selectedPlanId) ?? null);
    }
  }, [fixedIbPlanId, plans, selectedPlanId]);

  useEffect(() => {
    void loadPrograms(activePlanId);
  }, [activePlanId, loadPrograms]);

  useEffect(() => {
    void loadSubscriptions(page, appliedFilters);
  }, [appliedFilters, loadSubscriptions, page]);

  function commitFilters(
    form: IbPlanSubscriptionFilterFormState,
    nextSortBy = sortBy,
    nextDirection = sortDirection,
  ) {
    setPage(1);
    setAppliedFilters(formToAppliedFilters(form, nextSortBy, nextDirection));
  }

  function applyFiltersFromDraft() {
    commitFilters(draftFilters);
  }

  function clearFilters() {
    setDraftFilters(EMPTY_IB_PLAN_SUBSCRIPTION_FILTERS);
    setSortBy("created_at");
    setSortDirection("desc");
    commitFilters(EMPTY_IB_PLAN_SUBSCRIPTION_FILTERS, "created_at", "desc");
  }

  function toggleSort(column: IbPlanSubscriptionSortBy) {
    let nextDirection: IbPlanSubscriptionSortDirection = "asc";
    if (sortBy === column) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortBy(column);
    setSortDirection(nextDirection);
    commitFilters(draftFilters, column, nextDirection);
  }

  function patchDraft(
    patch: Partial<IbPlanSubscriptionFilterFormState>,
    options?: { apply?: boolean },
  ) {
    const next = { ...draftFilters, ...patch };
    setDraftFilters(next);
    if (options?.apply) {
      commitFilters(next);
    }
  }

  function onFilterEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyFiltersFromDraft();
    }
  }

  function handleMutationSuccess() {
    void loadSubscriptions(page, appliedFilters);
  }

  function openDetailDialog(subscription: IbPlanSubscription) {
    setSelectedSubscription(subscription);
    setDetailOpen(true);
  }

  function openReviewDialog(
    subscription: IbPlanSubscription,
    mode: "approve" | "reject",
  ) {
    setSelectedSubscription(subscription);
    setReviewMode(mode);
    setReviewOpen(true);
  }

  function openPlacementDialog(subscription: IbPlanSubscription) {
    setSelectedSubscription(subscription);
    setPlacementOpen(true);
  }

  function openParametersDialog(subscription: IbPlanSubscription) {
    setSelectedSubscription(subscription);
    setParametersOpen(true);
  }

  const showPlanSelector = !fixedIbPlanId;
  const canCreate = Boolean(activePlanId);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref={fixedIbPlanId ? "/ib-plans" : "/"}
        backLabel="Go back"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearFilters}
          disabled={loading}
          title="Clear column filters and sort"
        >
          <FilterXIcon data-icon="inline-start" />
          Clear filters
        </Button>
        {canCreate ? (
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon />
            New subscription
          </Button>
        ) : null}
      </PageContentToolbar>

      {showPlanSelector ? (
        <div className="rounded-xl border p-4">
          <div className="max-w-sm space-y-2">
            <Label htmlFor="subscription-plan-filter">IB plan</Label>
            {plansLoading ? (
              <Skeleton className="h-8 w-full" aria-hidden />
            ) : plans.length === 0 ? (
              <div className="flex h-8 items-center rounded-lg border px-2.5 text-sm text-muted-foreground">
                No IB plans available
              </div>
            ) : (
              <Select
                value={selectedPlanId}
                onValueChange={(value) => {
                  setSelectedPlanId(value ?? "");
                  setPage(1);
                  setDraftFilters((current) => ({
                    ...current,
                    ib_program_id: "",
                    ib_program_name: "",
                  }));
                  setAppliedFilters((current) => {
                    const next = { ...current };
                    delete next.ib_program_id;
                    delete next.ib_program_name;
                    return next;
                  });
                }}
              >
                <SelectTrigger
                  id="subscription-plan-filter"
                  className="w-full"
                >
                  <SelectValue placeholder="Select IB plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <ApiErrorAlert title="Could not load subscriptions" message={error} />
      ) : null}

      {!activePlanId && !plansLoading ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Select an IB plan to view subscriptions.
        </div>
      ) : (
        <div className="min-w-0 max-w-full overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[150px] align-bottom">
                  <ColumnSortHead
                    label="User ID"
                    sortKey="user.id"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                  <Input
                    className="mt-1.5 h-8 font-mono text-xs"
                    placeholder="UUID… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.user_id}
                    onChange={(event) =>
                      patchDraft({ user_id: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                  />
                </TableHead>

                <TableHead className="min-w-[140px] align-bottom">
                  <ColumnSortHead
                    label="User name"
                    sortKey="user.name"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                  <Input
                    className="mt-1.5 h-8"
                    placeholder="Name… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.user_name}
                    onChange={(event) =>
                      patchDraft({ user_name: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                  />
                </TableHead>

                <TableHead className="min-w-[160px] align-bottom">
                  <ColumnSortHead
                    label="User email"
                    sortKey="user.email"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                  <Input
                    className="mt-1.5 h-8"
                    placeholder="Email… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.user_email}
                    onChange={(event) =>
                      patchDraft({ user_email: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                  />
                </TableHead>

                <TableHead className="min-w-[130px] align-bottom">
                  <ColumnSortHead
                    label="Status"
                    sortKey="status"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                  <Select
                    value={draftFilters.status || "all"}
                    onValueChange={(value) =>
                      patchDraft(
                        {
                          status:
                            value === "pending" ||
                            value === "active" ||
                            value === "denied"
                              ? value
                              : "",
                        },
                        { apply: true },
                      )
                    }
                  >
                    <SelectTrigger className="mt-1.5 h-8 w-full">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {IB_PLAN_SUBSCRIPTION_STATUSES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>

                <TableHead className="min-w-[150px] align-bottom">
                  <ColumnSortHead
                    label="Program"
                    sortKey="ib_program_name"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                  <Select
                    value={draftFilters.ib_program_id || "all"}
                    onValueChange={(value) =>
                      patchDraft(
                        {
                          ib_program_id:
                            value === "all" ? "" : (value ?? ""),
                        },
                        { apply: true },
                      )
                    }
                    disabled={programsLoading}
                  >
                    <SelectTrigger className="mt-1.5 h-8 w-full">
                      <SelectValue
                        placeholder={
                          programsLoading ? "Loading…" : "All programs"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {programOptions.map((entry) => (
                        <SelectItem
                          key={entry.program.id}
                          value={entry.program.id}
                        >
                          {entry.program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="mt-1.5 h-8"
                    placeholder="Name… (Enter)"
                    title="Partial match on program name. Press Enter to apply."
                    value={draftFilters.ib_program_name}
                    onChange={(event) =>
                      patchDraft({ ib_program_name: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                  />
                </TableHead>

                <TableHead className="min-w-[120px] align-bottom text-right">
                  <ColumnSortHead
                    label="Personal rate"
                    sortKey="personal_rate"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                    align="right"
                  />
                  <Input
                    className="mt-1.5 h-8 text-right"
                    inputMode="decimal"
                    placeholder="Exact… (Enter)"
                    title="Exact match. Press Enter to apply."
                    value={draftFilters.personal_rate}
                    onChange={(event) =>
                      patchDraft({ personal_rate: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                  />
                </TableHead>

                <TableHead className="min-w-[120px] align-bottom">
                  <ColumnSortHead
                    label="Master"
                    sortKey="is_master"
                    activeSortBy={sortBy}
                    activeDirection={sortDirection}
                    onSort={toggleSort}
                    disabled={loading}
                  />
                  <Select
                    value={draftFilters.is_master || "all"}
                    onValueChange={(value) =>
                      patchDraft(
                        {
                          is_master:
                            value === "true" || value === "false"
                              ? value
                              : "",
                        },
                        { apply: true },
                      )
                    }
                  >
                    <SelectTrigger className="mt-1.5 h-8 w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Master only</SelectItem>
                      <SelectItem value="false">Non-master only</SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>

                <TableHead className="min-w-[160px] align-bottom">
                  <span className="text-xs font-medium">Comments</span>
                  <Input
                    className="mt-1.5 h-8"
                    placeholder="Contains… (Enter)"
                    title="Press Enter to apply filter"
                    value={draftFilters.comments}
                    onChange={(event) =>
                      patchDraft({ comments: event.target.value })
                    }
                    onKeyDown={onFilterEnter}
                  />
                </TableHead>

                <TableHead className="w-[180px] align-bottom text-right">
                  <span className="text-xs font-medium">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading || plansLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={TABLE_COLUMN_COUNT}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}

              {!loading && !plansLoading && subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={TABLE_COLUMN_COUNT}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No subscriptions found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && !plansLoading
                ? subscriptions.map((subscription) => {
                    const owner = resolveSubscriptionOwner(subscription);

                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <span
                            className="font-mono text-xs"
                            title={owner.id}
                          >
                            {owner.id ? abbreviateUuid(owner.id) : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {owner.name.trim() ? owner.name : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {owner.email?.trim() ? owner.email : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={subscriptionStatusVariant(
                              subscription.status,
                            )}
                          >
                            {subscriptionStatusLabel(subscription.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {resolveSubscriptionProgramName(subscription) || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {subscription.personal_rate}
                        </TableCell>
                        <TableCell>
                          {subscription.is_master ? "Yes" : "No"}
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">
                          {subscription.comments ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" aria-label={`Acciones para ${owner.name || owner.id}`} />}><MoreHorizontalIcon /></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailDialog(subscription)}><EyeIcon />Ver detalles</DropdownMenuItem>
                              <DropdownMenuItem disabled={!owner.id} onClick={() => owner.id && router.push(`/ib-analytics/${owner.id}`)}><BarChart3Icon />Ver métricas IB</DropdownMenuItem>
                              {subscription.status === "pending" || subscription.status === "active" ? <><DropdownMenuSeparator /><DropdownMenuItem onClick={() => openParametersDialog(subscription)}><PencilIcon />Editar parámetros</DropdownMenuItem></> : null}
                              {subscription.status === "pending" ? <><DropdownMenuItem onClick={() => openReviewDialog(subscription, "approve")}><CheckIcon />Aprobar</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => openReviewDialog(subscription, "reject")}><XIcon />Rechazar</DropdownMenuItem></> : null}
                              {subscription.status === "active" ? <DropdownMenuItem onClick={() => openPlacementDialog(subscription)}><ArrowRightLeftIcon />Mover programa o fijar</DropdownMenuItem> : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                : null}
            </TableBody>
          </Table>
        </div>
      )}

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

      {activePlanId ? (
        <>
          <IbPlanSubscriptionFormDialog
            ibPlanId={activePlanId}
            open={formOpen}
            onOpenChange={setFormOpen}
            onSuccess={handleMutationSuccess}
          />

          <IbPlanSubscriptionReviewDialog
            ibPlanId={activePlanId}
            subscription={selectedSubscription}
            mode={reviewMode}
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            onSuccess={handleMutationSuccess}
          />

          <IbPlanSubscriptionPlacementDialog
            ibPlanId={activePlanId}
            subscription={selectedSubscription}
            open={placementOpen}
            onOpenChange={setPlacementOpen}
            onSuccess={handleMutationSuccess}
          />

          <IbPlanSubscriptionParametersDialog
            ibPlanId={activePlanId}
            subscription={selectedSubscription}
            open={parametersOpen}
            onOpenChange={setParametersOpen}
            onSuccess={handleMutationSuccess}
          />
        </>
      ) : null}

      <IbPlanSubscriptionDetailDialog
        subscription={selectedSubscription}
        planName={selectedPlan?.name}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
