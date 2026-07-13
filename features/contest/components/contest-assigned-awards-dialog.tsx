"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Link2Icon, PencilIcon, UnlinkIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { Button } from "@/components/ui/button";
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
  assignContestAward,
  listAssignedContestAwards,
  listContestAwards,
  unassignContestAward,
  updateAssignedContestAward,
} from "@/features/contest/api";
import {
  CONTEST_AWARD_TYPES,
  type Contest,
  type ContestAward,
} from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ContestAssignedAwardsDialogProps = {
  contest: Contest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const ALL_AWARDS_VALUE = "__none__";

const awardTypeLabels = Object.fromEntries(
  CONTEST_AWARD_TYPES.map((option) => [option.value, option.label]),
) as Record<string, string>;

export function ContestAssignedAwardsDialog({
  contest,
  open,
  onOpenChange,
  onSuccess,
}: ContestAssignedAwardsDialogProps) {
  const [assignedAwards, setAssignedAwards] = useState<ContestAward[]>([]);
  const [libraryAwards, setLibraryAwards] = useState<ContestAward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [selectedAwardId, setSelectedAwardId] = useState("");
  const [assignPosition, setAssignPosition] = useState(1);

  const loadData = useCallback(async () => {
    if (!contest) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [assignedResponse, libraryResponse] = await Promise.all([
        listAssignedContestAwards(contest.id),
        listContestAwards({ per_page: 100 }),
      ]);

      setAssignedAwards(assignedResponse.data);
      setLibraryAwards(libraryResponse.data);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setAssignedAwards([]);
      setLibraryAwards([]);
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
    () => new Set(assignedAwards.map((award) => award.id)),
    [assignedAwards],
  );

  const availableAwards = useMemo(
    () => libraryAwards.filter((award) => !assignedIds.has(award.id)),
    [libraryAwards, assignedIds],
  );

  const sortedAssigned = useMemo(() => {
    return [...assignedAwards].sort(
      (left, right) => (left.position ?? 0) - (right.position ?? 0),
    );
  }, [assignedAwards]);

  async function handleAssign() {
    if (!contest || !selectedAwardId) {
      return;
    }

    setAssigning(true);
    setActionError(null);

    try {
      await assignContestAward(contest.id, selectedAwardId, {
        position: assignPosition,
      });

      setSelectedAwardId("");
      setAssignPosition(1);
      await loadData();
      onSuccess();
    } catch (assignError) {
      setActionError(formatBrokerApiError(assignError));
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassign(award: ContestAward) {
    if (!contest) {
      return;
    }

    setActionError(null);

    try {
      await unassignContestAward(contest.id, award.id);
      await loadData();
      onSuccess();
    } catch (unassignError) {
      setActionError(formatBrokerApiError(unassignError));
    }
  }

  async function handlePositionChange(award: ContestAward, position: number) {
    if (!contest) {
      return;
    }

    setActionError(null);

    try {
      await updateAssignedContestAward(contest.id, award.id, { position });
      await loadData();
      onSuccess();
    } catch (updateError) {
      setActionError(formatBrokerApiError(updateError));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Assigned awards</DialogTitle>
          <DialogDescription>
            Link award templates to{" "}
            <span className="font-medium text-foreground">
              {contest?.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
          {error ? (
            <ApiErrorAlert title="Could not load awards" message={error} />
          ) : null}

          {actionError ? (
            <ApiErrorAlert title="Action failed" message={actionError} />
          ) : null}

          <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="assign-award">Award template</Label>
              <Select
                value={selectedAwardId || ALL_AWARDS_VALUE}
                onValueChange={(value) =>
                  setSelectedAwardId(
                    value === ALL_AWARDS_VALUE ? "" : (value ?? ""),
                  )
                }
                disabled={assigning || loading}
              >
                <SelectTrigger id="assign-award" className="w-full">
                  <SelectValue placeholder="Select award" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_AWARDS_VALUE}>Select award</SelectItem>
                  {availableAwards.map((award) => (
                    <SelectItem key={award.id} value={award.id}>
                      {award.name} (
                      {awardTypeLabels[award.award_type] ?? award.award_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign-award-position">Position</Label>
              <Input
                id="assign-award-position"
                type="number"
                min={1}
                value={assignPosition}
                onChange={(event) =>
                  setAssignPosition(Number(event.target.value) || 1)
                }
                disabled={assigning || loading}
              />
            </div>

            <Button
              onClick={() => void handleAssign()}
              disabled={assigning || loading || !selectedAwardId || !contest}
            >
              <Link2Icon />
              Assign
            </Button>
          </div>

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
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
                      No awards assigned.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading
                  ? sortedAssigned.map((award) => (
                      <TableRow key={award.id}>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            className="w-24"
                            defaultValue={award.position ?? 1}
                            onBlur={(event) =>
                              void handlePositionChange(
                                award,
                                Number(event.target.value) || 1,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {award.name}
                        </TableCell>
                        <TableCell>
                          {awardTypeLabels[award.award_type] ??
                            award.award_type}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip={`Unassign ${award.name}`}
                              onClick={() => void handleUnassign(award)}
                            >
                              <UnlinkIcon />
                            </ActionTooltipButton>
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip={`Edit ${award.name} in library`}
                              render={
                                <Link href="/contest-awards" target="_blank" />
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
