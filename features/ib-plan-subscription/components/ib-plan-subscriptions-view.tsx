"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeftIcon,
  CheckIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
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
import { listIbPlans } from "@/features/ib-plan/api";
import type { IbPlan } from "@/features/ib-plan/types";
import {
  IB_PLAN_SUBSCRIPTION_STATUSES,
  listIbPlanSubscriptions,
  subscriptionStatusLabel,
  subscriptionStatusVariant,
  type IbPlanSubscription,
  type IbPlanSubscriptionStatus,
} from "@/features/ib-plan-subscription";
import { IbPlanSubscriptionDetailDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-detail-dialog";
import { IbPlanSubscriptionFormDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-form-dialog";
import { IbPlanSubscriptionParametersDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-parameters-dialog";
import { IbPlanSubscriptionPlacementDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-placement-dialog";
import { IbPlanSubscriptionReviewDialog } from "@/features/ib-plan-subscription/components/ib-plan-subscription-review-dialog";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

type IbPlanSubscriptionsViewProps = {
  ibPlanId?: string;
};

type StatusFilter = IbPlanSubscriptionStatus | "all";
type MasterFilter = "all" | "master" | "non-master";

export function IbPlanSubscriptionsView({
  ibPlanId: fixedIbPlanId,
}: IbPlanSubscriptionsViewProps) {
  const [plans, setPlans] = useState<IbPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(!fixedIbPlanId);
  const [selectedPlanId, setSelectedPlanId] = useState(fixedIbPlanId ?? "");
  const [selectedPlan, setSelectedPlan] = useState<IbPlan | null>(null);

  const [subscriptions, setSubscriptions] = useState<IbPlanSubscription[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [externalUserIdInput, setExternalUserIdInput] = useState("");
  const [externalUserIdFilter, setExternalUserIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [masterFilter, setMasterFilter] = useState<MasterFilter>("all");

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

  const loadSubscriptions = useCallback(
    async (requestedPage: number) => {
      if (!activePlanId) {
        setSubscriptions([]);
        setPagination(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await listIbPlanSubscriptions(activePlanId, {
          page: requestedPage,
          per_page: 15,
          ...(externalUserIdFilter
            ? { external_user_id: externalUserIdFilter }
            : {}),
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(masterFilter === "master"
            ? { is_master: true }
            : masterFilter === "non-master"
              ? { is_master: false }
              : {}),
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
    [activePlanId, externalUserIdFilter, statusFilter, masterFilter],
  );

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    void loadSubscriptions(page);
  }, [loadSubscriptions, page]);

  useEffect(() => {
    if (!fixedIbPlanId) {
      setSelectedPlan(plans.find((plan) => plan.id === selectedPlanId) ?? null);
    }
  }, [fixedIbPlanId, plans, selectedPlanId]);

  function applyFilters() {
    setPage(1);
    setExternalUserIdFilter(externalUserIdInput.trim());
  }

  function clearFilters() {
    setExternalUserIdInput("");
    setExternalUserIdFilter("");
    setStatusFilter("pending");
    setMasterFilter("all");
    setPage(1);
  }

  function handleMutationSuccess() {
    void loadSubscriptions(page);
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
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref={fixedIbPlanId ? "/ib-plans" : "/"}
        backLabel="Go back"
      >
        {canCreate ? (
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon />
            New subscription
          </Button>
        ) : null}
      </PageContentToolbar>

      <div className="rounded-xl border p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {showPlanSelector ? (
            <div className="space-y-2">
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
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="subscription-status-filter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter((value ?? "all") as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger
                id="subscription-status-filter"
                className="w-full"
              >
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {IB_PLAN_SUBSCRIPTION_STATUSES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription-master-filter">Master IB</Label>
            <Select
              value={masterFilter}
              onValueChange={(value) => {
                setMasterFilter((value ?? "all") as MasterFilter);
                setPage(1);
              }}
            >
              <SelectTrigger
                id="subscription-master-filter"
                className="w-full"
              >
                <SelectValue placeholder="Filter by master IB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="master">Master only</SelectItem>
                <SelectItem value="non-master">Non-master only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscription-user-filter">External user ID</Label>
            <Input
              id="subscription-user-filter"
              value={externalUserIdInput}
              onChange={(event) => setExternalUserIdInput(event.target.value)}
              placeholder="Filter by user ID"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={applyFilters}>
            Apply filters
          </Button>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      {error ? (
        <ApiErrorAlert title="Could not load subscriptions" message={error} />
      ) : null}

      {!activePlanId && !plansLoading ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Select an IB plan to view subscriptions.
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Personal rate</TableHead>
                <TableHead>Master</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading || plansLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}

              {!loading && !plansLoading && subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No subscriptions found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && !plansLoading
                ? subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-mono text-xs">
                        {subscription.external_user_id}
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
                        {subscription.placement?.program?.name ?? "—"}
                      </TableCell>
                      <TableCell>{subscription.personal_rate}</TableCell>
                      <TableCell>
                        {subscription.is_master ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {subscription.comments ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip="View details"
                            onClick={() => openDetailDialog(subscription)}
                          >
                            <EyeIcon />
                          </ActionTooltipButton>

                          {subscription.status === "pending" ||
                          subscription.status === "active" ? (
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Edit subscription parameters"
                              onClick={() => openParametersDialog(subscription)}
                            >
                              <PencilIcon />
                            </ActionTooltipButton>
                          ) : null}

                          {subscription.status === "pending" ? (
                            <>
                              <ActionTooltipButton
                                variant="ghost"
                                size="icon-sm"
                                tooltip="Approve subscription"
                                onClick={() =>
                                  openReviewDialog(subscription, "approve")
                                }
                              >
                                <CheckIcon />
                              </ActionTooltipButton>
                              <ActionTooltipButton
                                variant="ghost"
                                size="icon-sm"
                                tooltip="Reject subscription"
                                onClick={() =>
                                  openReviewDialog(subscription, "reject")
                                }
                              >
                                <XIcon />
                              </ActionTooltipButton>
                            </>
                          ) : null}

                          {subscription.status === "active" ? (
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Move program or pin placement"
                              onClick={() => openPlacementDialog(subscription)}
                            >
                              <ArrowRightLeftIcon />
                            </ActionTooltipButton>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
