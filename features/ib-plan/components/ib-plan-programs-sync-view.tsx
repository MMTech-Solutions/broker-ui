"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GripVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
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
import { listIbPlanPrograms, listIbPlans, syncIbPlanPrograms } from "@/features/ib-plan/api";
import { IbPlanProgramPivotFormDialog } from "@/features/ib-plan/components/ib-plan-program-pivot-form-dialog";
import {
  decodePlanProgramDragPayload,
  encodePlanProgramDragPayload,
  PLAN_PROGRAM_DRAG_MIME,
  type PlanProgramDragPayload,
} from "@/features/ib-plan/plan-programs-dnd";
import {
  assignmentsSignature,
  assignmentsToSyncPayload,
  mapPlanProgramsToAssignments,
  moveProgramToAssigned,
  moveProgramToAvailable,
  reorderAssignedPrograms,
  splitAvailablePrograms,
  updateAssignmentPivot,
} from "@/features/ib-plan/plan-programs-utils";
import type { IbPlan, PlanProgramAssignment } from "@/features/ib-plan/types";
import { listIbPrograms } from "@/features/ib-program/api";
import type { IbProgram } from "@/features/ib-program/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

type IbPlanProgramsSyncViewProps = {
  ibPlanId: string;
};

function AvailableProgramItem({
  program,
  disabled,
}: {
  program: IbProgram;
  disabled?: boolean;
}) {
  function handleDragStart(event: React.DragEvent<HTMLDivElement>) {
    if (disabled) {
      event.preventDefault();
      return;
    }

    const payload: PlanProgramDragPayload = {
      programId: program.id,
      source: "available",
    };

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      PLAN_PROGRAM_DRAG_MIME,
      encodePlanProgramDragPayload(payload),
    );
  }

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      className={cn(
        "flex cursor-grab items-start gap-2 rounded-lg border bg-background px-3 py-2 active:cursor-grabbing",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <GripVerticalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{program.name}</p>
      </div>
    </div>
  );
}

export function IbPlanProgramsSyncView({ ibPlanId }: IbPlanProgramsSyncViewProps) {
  const [ibPlan, setIbPlan] = useState<IbPlan | null>(null);
  const [availablePrograms, setAvailablePrograms] = useState<IbProgram[]>([]);
  const [assignedPrograms, setAssignedPrograms] = useState<
    PlanProgramAssignment[]
  >([]);
  const [initialSignature, setInitialSignature] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [thresholdsWarningMessage, setThresholdsWarningMessage] = useState<
    string | null
  >(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [availableDropActive, setAvailableDropActive] = useState(false);
  const [assignedDragOverIndex, setAssignedDragOverIndex] = useState<
    number | null
  >(null);

  const [pivotOpen, setPivotOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] =
    useState<PlanProgramAssignment | null>(null);

  const thresholdsCacheRef = useRef(
    new Map<string, { min: string; max: string }>(),
  );

  const isDirty = useMemo(
    () => assignmentsSignature(assignedPrograms) !== initialSignature,
    [assignedPrograms, initialSignature],
  );

  const breadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "IB Plans", href: "/ib-plans" },
      {
        label: ibPlan?.name ?? "Plan",
        href: `/ib-plans/${ibPlanId}/programs`,
      },
      { label: "Programs", current: true },
    ],
    [ibPlan?.name, ibPlanId],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSyncSuccess(null);

    try {
      const [plansResponse, allProgramsResponse, planProgramsResponse] =
        await Promise.all([
          listIbPlans({ per_page: 100 }),
          listIbPrograms({ per_page: 100 }),
          listIbPlanPrograms(ibPlanId),
        ]);

      const plan =
        plansResponse.data.find((entry) => entry.id === ibPlanId) ?? null;

      if (!plan) {
        throw new Error("IB plan not found.");
      }

      const assigned = mapPlanProgramsToAssignments(
        planProgramsResponse.data.programs,
      );
      const available = splitAvailablePrograms(
        allProgramsResponse.data,
        assigned,
      );

      setIbPlan(plan);
      setAssignedPrograms(assigned);
      setAvailablePrograms(available);
      setInitialSignature(assignmentsSignature(assigned));
      setThresholdsWarningMessage(
        planProgramsResponse.meta.thresholds_warning_message ?? null,
      );

      const cache = new Map<string, { min: string; max: string }>();
      for (const entry of assigned) {
        cache.set(entry.ibProgramId, {
          min: entry.progressionMinVolume,
          max: entry.progressionMaxVolume,
        });
      }
      thresholdsCacheRef.current = cache;
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setIbPlan(null);
      setAvailablePrograms([]);
      setAssignedPrograms([]);
      setInitialSignature("");
      setThresholdsWarningMessage(null);
    } finally {
      setLoading(false);
    }
  }, [ibPlanId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleAssignedDrop(
    payload: PlanProgramDragPayload,
    targetIndex: number,
  ) {
    if (submitting) {
      return;
    }

    if (payload.source === "available") {
      const insertIndex = Math.min(targetIndex, assignedPrograms.length);
      const result = moveProgramToAssigned(
        availablePrograms,
        assignedPrograms,
        payload.programId,
        insertIndex,
        thresholdsCacheRef.current,
      );

      setAvailablePrograms(result.available);
      setAssignedPrograms(result.assigned);
      return;
    }

    if (payload.source === "assigned" && payload.sourceIndex !== undefined) {
      if (assignedPrograms.length <= 1) {
        return;
      }

      const destinationIndex = Math.min(
        targetIndex,
        assignedPrograms.length - 1,
      );

      if (payload.sourceIndex === destinationIndex) {
        return;
      }

      setAssignedPrograms((current) =>
        reorderAssignedPrograms(
          current,
          payload.sourceIndex!,
          destinationIndex,
        ),
      );
    }
  }

  function handleDropOnAssigned(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    setDropZoneActive(false);
    setAssignedDragOverIndex(null);

    const payload = decodePlanProgramDragPayload(
      event.dataTransfer.getData(PLAN_PROGRAM_DRAG_MIME),
    );

    if (!payload) {
      return;
    }

    handleAssignedDrop(payload, assignedPrograms.length);
  }

  function handleDropOnAssignedRow(
    event: React.DragEvent<HTMLTableRowElement>,
    targetIndex: number,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setDropZoneActive(false);
    setAssignedDragOverIndex(null);

    const payload = decodePlanProgramDragPayload(
      event.dataTransfer.getData(PLAN_PROGRAM_DRAG_MIME),
    );

    if (!payload) {
      return;
    }

    handleAssignedDrop(payload, targetIndex);
  }

  function handleDropOnAvailable(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    setAvailableDropActive(false);

    if (submitting) {
      return;
    }

    const payload = decodePlanProgramDragPayload(
      event.dataTransfer.getData(PLAN_PROGRAM_DRAG_MIME),
    );

    if (!payload || payload.source !== "assigned") {
      return;
    }

    const result = moveProgramToAvailable(
      availablePrograms,
      assignedPrograms,
      payload.programId,
      thresholdsCacheRef.current,
    );

    setAvailablePrograms(result.available);
    setAssignedPrograms(result.assigned);
  }

  function handleRemoveAssignment(programId: string) {
    const result = moveProgramToAvailable(
      availablePrograms,
      assignedPrograms,
      programId,
      thresholdsCacheRef.current,
    );

    setAvailablePrograms(result.available);
    setAssignedPrograms(result.assigned);
  }

  function openPivotDialog(assignment: PlanProgramAssignment) {
    setAssignmentToEdit(assignment);
    setPivotOpen(true);
  }

  function handlePivotSave(updates: {
    sortOrder: number;
    progressionMinVolume: string;
    progressionMaxVolume: string;
  }) {
    if (!assignmentToEdit) {
      return;
    }

    setAssignedPrograms((current) =>
      updateAssignmentPivot(
        current,
        assignmentToEdit.ibProgramId,
        updates,
        thresholdsCacheRef.current,
      ),
    );
  }

  async function handleSync() {
    setSubmitting(true);
    setError(null);
    setSyncSuccess(null);

    try {
      await syncIbPlanPrograms(ibPlanId, {
        programs: assignmentsToSyncPayload(assignedPrograms),
      });

      setInitialSignature(assignmentsSignature(assignedPrograms));
      setSyncSuccess("Plan programs synchronized successfully.");
      await loadData();
    } catch (syncError) {
      setError(formatBrokerApiError(syncError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref="/ib-plans"
        backLabel="Ir atrás"
      >
        <Button
          onClick={() => void handleSync()}
          disabled={loading || submitting || !isDirty}
        >
          {submitting ? "Syncing..." : "Sync programs"}
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert title="Could not load plan programs" message={error} />
      ) : null}

      {syncSuccess ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
          {syncSuccess}
        </p>
      ) : null}

      {thresholdsWarningMessage ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          {thresholdsWarningMessage}
        </p>
      ) : null}

      {loading ? (
        <div className="flex flex-1 gap-4">
          <Skeleton className="h-[480px] w-72 shrink-0" />
          <Skeleton className="h-[480px] flex-1" />
        </div>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
          <aside className="flex w-full shrink-0 flex-col gap-2 overflow-x-hidden lg:w-72 lg:max-w-72">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Available programs</h2>
              <p className="text-xs text-muted-foreground">
                Drag a program into the plan workspace.
              </p>
            </div>

            <div
              className={cn(
                "flex max-h-[calc(100vh-16rem)] min-h-[320px] flex-col gap-2 overflow-y-auto rounded-xl border p-2 transition-colors",
                availableDropActive && "border-primary bg-primary/5",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setAvailableDropActive(true);
              }}
              onDragLeave={() => setAvailableDropActive(false)}
              onDrop={handleDropOnAvailable}
            >
              {availablePrograms.length === 0 ? (
                <p className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
                  No available programs.
                </p>
              ) : (
                availablePrograms.map((program) => (
                  <AvailableProgramItem
                    key={program.id}
                    program={program}
                    disabled={submitting}
                  />
                ))
              )}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden">
            <div className="space-y-1 shrink-0">
              <h2 className="text-sm font-medium">Plan programs</h2>
              <p className="text-xs text-muted-foreground">
                Drop programs here and drag rows to reorder progression.
              </p>
            </div>

            <div
              className={cn(
                "flex min-h-[320px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border transition-colors",
                dropZoneActive && "border-primary bg-primary/5",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setDropZoneActive(true);
              }}
              onDragLeave={() => setDropZoneActive(false)}
              onDrop={handleDropOnAssigned}
            >
              {assignedPrograms.length === 0 ? (
                <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
                  Drop programs here to assign them to this plan.
                </div>
              ) : (
                <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8" />
                        <TableHead className="min-w-[200px]">Program</TableHead>
                        <TableHead className="w-16">Order</TableHead>
                        <TableHead className="w-36">Min progression volume</TableHead>
                        <TableHead className="w-36">Max progression volume</TableHead>
                        <TableHead className="w-[88px] text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedPrograms.map((assignment, index) => (
                        <TableRow
                          key={assignment.ibProgramId}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setAssignedDragOverIndex(index);
                          }}
                          onDragLeave={() =>
                            setAssignedDragOverIndex((current) =>
                              current === index ? null : current,
                            )
                          }
                          onDrop={(event) =>
                            handleDropOnAssignedRow(event, index)
                          }
                          className={cn(
                            assignedDragOverIndex === index &&
                              "bg-primary/5 ring-1 ring-inset ring-primary/30",
                          )}
                        >
                          <TableCell className="w-8">
                            <div
                              draggable={!submitting}
                              onDragStart={(event) => {
                                const payload: PlanProgramDragPayload = {
                                  programId: assignment.ibProgramId,
                                  source: "assigned",
                                  sourceIndex: index,
                                };
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData(
                                  PLAN_PROGRAM_DRAG_MIME,
                                  encodePlanProgramDragPayload(payload),
                                );
                              }}
                              className={cn(
                                "flex cursor-grab items-center justify-center active:cursor-grabbing",
                                submitting && "cursor-not-allowed opacity-60",
                              )}
                            >
                              <GripVerticalIcon className="size-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[280px] whitespace-normal">
                            <p className="truncate font-medium">
                              {assignment.name}
                            </p>
                          </TableCell>
                          <TableCell>{assignment.sortOrder}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {assignment.progressionMinVolume}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {assignment.progressionMaxVolume}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <ActionTooltipButton
                                variant="ghost"
                                size="icon-sm"
                                tooltip={`Edit ${assignment.name}`}
                                disabled={submitting}
                                onClick={() => openPivotDialog(assignment)}
                              >
                                <PencilIcon />
                              </ActionTooltipButton>
                              <ActionTooltipButton
                                variant="ghost"
                                size="icon-sm"
                                tooltip={`Remove ${assignment.name}`}
                                disabled={submitting}
                                onClick={() =>
                                  handleRemoveAssignment(assignment.ibProgramId)
                                }
                              >
                                <Trash2Icon />
                              </ActionTooltipButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <IbPlanProgramPivotFormDialog
        assignment={assignmentToEdit}
        open={pivotOpen}
        onOpenChange={setPivotOpen}
        onSave={handlePivotSave}
      />
    </div>
  );
}
