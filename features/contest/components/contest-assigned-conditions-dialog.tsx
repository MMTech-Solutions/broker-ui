"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link2Icon, PencilIcon, UnlinkIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  assignContestCondition,
  listAssignedContestConditions,
  listContestConditions,
  unassignContestCondition,
  updateAssignedContestCondition,
} from "@/features/contest/api";
import type { Contest, ContestCondition } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ContestAssignedConditionsDialogProps = {
  contest: Contest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NONE_CONDITION_VALUE = "__none__";

export function ContestAssignedConditionsDialog({
  contest,
  open,
  onOpenChange,
}: ContestAssignedConditionsDialogProps) {
  const [assignedConditions, setAssignedConditions] = useState<
    ContestCondition[]
  >([]);
  const [libraryConditions, setLibraryConditions] = useState<
    ContestCondition[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [selectedConditionId, setSelectedConditionId] = useState("");
  const [assignVisible, setAssignVisible] = useState(true);
  const [assignSortOrder, setAssignSortOrder] = useState(0);

  const loadData = useCallback(async () => {
    if (!contest) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [assignedResponse, libraryResponse] = await Promise.all([
        listAssignedContestConditions(contest.id),
        listContestConditions({ per_page: 100 }),
      ]);

      setAssignedConditions(assignedResponse.data);
      setLibraryConditions(libraryResponse.data);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setAssignedConditions([]);
      setLibraryConditions([]);
    } finally {
      setLoading(false);
    }
  }, [contest]);

  useEffect(() => {
    if (open && contest) {
      void loadData();
    }
  }, [open, contest, loadData]);

  const assignedIds = useMemo(
    () => new Set(assignedConditions.map((condition) => condition.id)),
    [assignedConditions],
  );

  const availableConditions = useMemo(
    () =>
      libraryConditions.filter((condition) => !assignedIds.has(condition.id)),
    [libraryConditions, assignedIds],
  );

  const sortedAssigned = useMemo(() => {
    return [...assignedConditions].sort(
      (left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0),
    );
  }, [assignedConditions]);

  async function handleAssign() {
    if (!contest || !selectedConditionId) {
      return;
    }

    setAssigning(true);
    setActionError(null);

    try {
      await assignContestCondition(contest.id, selectedConditionId, {
        is_visible: assignVisible,
        sort_order: assignSortOrder,
      });

      setSelectedConditionId("");
      setAssignSortOrder(0);
      setAssignVisible(true);
      await loadData();
    } catch (assignError) {
      setActionError(formatBrokerApiError(assignError));
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassign(condition: ContestCondition) {
    if (!contest) {
      return;
    }

    setActionError(null);

    try {
      await unassignContestCondition(contest.id, condition.id);
      await loadData();
    } catch (unassignError) {
      setActionError(formatBrokerApiError(unassignError));
    }
  }

  async function handleToggleVisibility(condition: ContestCondition) {
    if (!contest) {
      return;
    }

    setActionError(null);

    try {
      await updateAssignedContestCondition(contest.id, condition.id, {
        is_visible: !(condition.is_visible ?? true),
      });
      await loadData();
    } catch (updateError) {
      setActionError(formatBrokerApiError(updateError));
    }
  }

  async function handleSortOrderChange(
    condition: ContestCondition,
    sortOrder: number,
  ) {
    if (!contest) {
      return;
    }

    setActionError(null);

    try {
      await updateAssignedContestCondition(contest.id, condition.id, {
        sort_order: sortOrder,
      });
      await loadData();
    } catch (updateError) {
      setActionError(formatBrokerApiError(updateError));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Assigned conditions</DialogTitle>
          <DialogDescription>
            Link condition templates to{" "}
            <span className="font-medium text-foreground">
              {contest?.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
          {error ? (
            <ApiErrorAlert title="Could not load conditions" message={error} />
          ) : null}

          {actionError ? (
            <ApiErrorAlert title="Action failed" message={actionError} />
          ) : null}

          <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="assign-condition">Condition template</Label>
              <Select
                value={selectedConditionId || NONE_CONDITION_VALUE}
                onValueChange={(value) =>
                  setSelectedConditionId(
                    value === NONE_CONDITION_VALUE ? "" : (value ?? ""),
                  )
                }
                disabled={assigning || loading}
              >
                <SelectTrigger id="assign-condition" className="w-full">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_CONDITION_VALUE}>
                    Select condition
                  </SelectItem>
                  {availableConditions.map((condition) => (
                    <SelectItem key={condition.id} value={condition.id}>
                      {condition.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign-sort-order">Sort order</Label>
              <Input
                id="assign-sort-order"
                type="number"
                min={0}
                value={assignSortOrder}
                onChange={(event) =>
                  setAssignSortOrder(Number(event.target.value) || 0)
                }
                disabled={assigning || loading}
              />
            </div>

            <div className="flex items-center gap-2 pb-2">
              <Checkbox
                id="assign-visible"
                checked={assignVisible}
                onCheckedChange={(checked) =>
                  setAssignVisible(checked === true)
                }
                disabled={assigning || loading}
              />
              <Label htmlFor="assign-visible">Visible</Label>
            </div>

            <Button
              onClick={() => void handleAssign()}
              disabled={
                assigning || loading || !selectedConditionId || !contest
              }
            >
              <Link2Icon />
              Assign
            </Button>
          </div>

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Sort order</TableHead>
                  <TableHead className="w-[108px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={4}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loading && sortedAssigned.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No conditions assigned.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading
                  ? sortedAssigned.map((condition) => (
                      <TableRow key={condition.id}>
                        <TableCell className="font-medium">
                          {condition.title}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={condition.is_visible ?? true}
                            onCheckedChange={() =>
                              void handleToggleVisibility(condition)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="w-24"
                            defaultValue={condition.sort_order ?? 0}
                            onBlur={(event) =>
                              void handleSortOrderChange(
                                condition,
                                Number(event.target.value) || 0,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip={`Unassign ${condition.title}`}
                              onClick={() => void handleUnassign(condition)}
                            >
                              <UnlinkIcon />
                            </ActionTooltipButton>
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip={`Edit ${condition.title} in library`}
                              onClick={() =>
                                window.open("/contest-conditions", "_blank")
                              }
                            >
                              <PencilIcon />
                            </ActionTooltipButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
