"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayersIcon,
  ListIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listInsurancePlans } from "@/features/insurance/api";
import { InsurancePlanDeleteDialog } from "@/features/insurance/components/insurance-plan-delete-dialog";
import { InsurancePlanFormDialog } from "@/features/insurance/components/insurance-plan-form-dialog";
import { InsurancePlanOptionsDialog } from "@/features/insurance/components/insurance-plan-options-dialog";
import { InsurancePlanServerGroupsDialog } from "@/features/insurance/components/insurance-plan-server-groups-dialog";
import type { InsurancePlan } from "@/features/insurance/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Insurance plans", current: true },
];

export function InsurancePlansView() {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [appliedNameFilter, setAppliedNameFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<InsurancePlan | null>(null);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [serverGroupsOpen, setServerGroupsOpen] = useState(false);

  const loadPlans = useCallback(async (requestedPage: number, name?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await listInsurancePlans({
        page: requestedPage,
        per_page: 15,
        ...(name ? { name } : {}),
      });

      setPlans(response.data);
      setPagination(response.meta.pagination ?? null);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setPlans([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans(page, appliedNameFilter || undefined);
  }, [loadPlans, page, appliedNameFilter]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedNameFilter(nameFilter.trim());
  }

  function openCreateDialog() {
    setFormMode("create");
    setSelectedPlan(null);
    setFormOpen(true);
  }

  function openEditDialog(plan: InsurancePlan) {
    setFormMode("edit");
    setSelectedPlan(plan);
    setFormOpen(true);
  }

  function openOptionsDialog(plan: InsurancePlan) {
    setSelectedPlan(plan);
    setOptionsOpen(true);
  }

  function openServerGroupsDialog(plan: InsurancePlan) {
    setSelectedPlan(plan);
    setServerGroupsOpen(true);
  }

  function openDeleteDialog(plan: InsurancePlan) {
    setPlanToDelete(plan);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    void loadPlans(page, appliedNameFilter || undefined);
  }

  useEffect(() => {
    if (!optionsOpen && !serverGroupsOpen) {
      return;
    }

    const refreshedPlan = plans.find((plan) => plan.id === selectedPlan?.id);

    if (refreshedPlan) {
      setSelectedPlan(refreshedPlan);
    }
  }, [optionsOpen, plans, selectedPlan, serverGroupsOpen]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={breadcrumbs}>
        <Button onClick={openCreateDialog}>
          <PlusIcon />
          New plan
        </Button>
      </PageContentToolbar>

      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={handleSearchSubmit}
      >
        <Input
          value={nameFilter}
          onChange={(event) => setNameFilter(event.target.value)}
          placeholder="Filter by name"
          className="sm:max-w-xs"
        />
        <Button type="submit" variant="secondary" disabled={loading}>
          Search
        </Button>
      </form>

      {error ? (
        <ApiErrorAlert title="Could not load insurance plans" message={error} />
      ) : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Server groups</TableHead>
              <TableHead>Approval</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[168px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`plan-skeleton-${index}`}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && plans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No insurance plans found.
                </TableCell>
              </TableRow>
            ) : null}

            {!loading
              ? plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {plan.description || "—"}
                    </TableCell>
                    <TableCell>{plan.options_count ?? 0}</TableCell>
                    <TableCell>{plan.server_groups_count ?? 0}</TableCell>
                    <TableCell>
                      {plan.requires_approval ? "Required" : "Automatic"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Options for ${plan.name}`}
                          onClick={() => openOptionsDialog(plan)}
                        >
                          <ListIcon />
                        </ActionTooltipButton>
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Server groups for ${plan.name}`}
                          onClick={() => openServerGroupsDialog(plan)}
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

      <InsurancePlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        insurancePlan={selectedPlan}
        onSuccess={handleMutationSuccess}
      />

      <InsurancePlanDeleteDialog
        insurancePlan={planToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleMutationSuccess}
      />

      <InsurancePlanOptionsDialog
        insurancePlan={selectedPlan}
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        onSuccess={handleMutationSuccess}
      />

      <InsurancePlanServerGroupsDialog
        insurancePlan={selectedPlan}
        open={serverGroupsOpen}
        onOpenChange={setServerGroupsOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
