"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ClipboardListIcon,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { IbPlanDeleteDialog } from "@/features/ib-plan/components/ib-plan-delete-dialog";
import { IbPlanFormDialog } from "@/features/ib-plan/components/ib-plan-form-dialog";
import {
  IB_PLAN_SUBSCRIPTION_TYPES,
  type IbPlan,
} from "@/features/ib-plan/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

const ibPlansBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "IB Plans", current: true },
];

const subscriptionTypeLabels = Object.fromEntries(
  IB_PLAN_SUBSCRIPTION_TYPES.map((option) => [option.value, option.label]),
) as Record<string, string>;

export function IbPlansView() {
  const [ibPlans, setIbPlans] = useState<IbPlan[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPlan, setSelectedPlan] = useState<IbPlan | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<IbPlan | null>(null);

  const loadIbPlans = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await listIbPlans({
        page: requestedPage,
        per_page: 15,
      });

      setIbPlans(response.data);
      setPagination(response.meta.pagination ?? null);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setIbPlans([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIbPlans(page);
  }, [loadIbPlans, page]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedPlan(null);
    setFormOpen(true);
  }

  function openEditDialog(plan: IbPlan) {
    setFormMode("edit");
    setSelectedPlan(plan);
    setFormOpen(true);
  }

  function openDeleteDialog(plan: IbPlan) {
    setPlanToDelete(plan);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadIbPlans(page);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={ibPlansBreadcrumbs}
        backHref="/"
        backLabel="Ir atrás"
      >
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New IB plan
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert title="Could not load IB plans" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Subscriptions</TableHead>
              <TableHead>Programs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[144px] text-right">Actions</TableHead>
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

            {!loading && ibPlans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No IB plans found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? ibPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {plan.description}
                    </TableCell>
                    <TableCell>
                      {subscriptionTypeLabels[plan.subscription_type] ??
                        plan.subscription_type}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-sm">
                        <span>{plan.subscriptions_count ?? 0} total</span>
                        <span className="text-muted-foreground">
                          {plan.active_subscriptions_count ?? 0} active ·{" "}
                          {plan.inactive_subscriptions_count ?? 0} inactive
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{plan.programs_count ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant={plan.is_active ? "default" : "secondary"}
                        >
                          {plan.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {plan.thresholds_warning ? (
                          <Badge variant="outline">Threshold gaps</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`View subscriptions for ${plan.name}`}
                          render={
                            <Link
                              href={`/ib-plans/${plan.id}/subscriptions`}
                            />
                          }
                        >
                          <ClipboardListIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Sync programs for ${plan.name}`}
                          render={
                            <Link href={`/ib-plans/${plan.id}/programs`} />
                          }
                        >
                          <LayersIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Edit ${plan.name}`}
                          onClick={() => openEditDialog(plan)}
                        >
                          <PencilIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Delete ${plan.name}`}
                          onClick={() => openDeleteDialog(plan)}
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

      <IbPlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        ibPlan={selectedPlan}
        onSuccess={handleMutationSuccess}
      />

      <IbPlanDeleteDialog
        ibPlan={planToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
