"use client";

import { useCallback, useEffect, useState } from "react";
import { Undo2Icon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listContestBans, revertContestBan } from "@/features/contest/api";
import { formatContestDateTime } from "@/features/contest/format";
import type { Contest, ContestBan } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type ContestBansDialogProps = {
  contest: Contest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ContestBansDialog({
  contest,
  open,
  onOpenChange,
  onSuccess,
}: ContestBansDialogProps) {
  const [bans, setBans] = useState<ContestBan[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [revertingBanId, setRevertingBanId] = useState<string | null>(null);

  const loadBans = useCallback(
    async (contestId: string, requestedPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await listContestBans(contestId, {
          page: requestedPage,
          per_page: 15,
        });

        setBans(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setBans([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (open && contest) {
      void loadBans(contest.id, page);
    }
  }, [open, contest, page, loadBans]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setActionError(null);
    }
  }, [open]);

  async function handleRevert(ban: ContestBan) {
    if (!contest || !ban.is_active) {
      return;
    }

    setRevertingBanId(ban.id);
    setActionError(null);

    try {
      await revertContestBan(contest.id, ban.id);
      await loadBans(contest.id, page);
      onSuccess();
    } catch (revertError) {
      setActionError(formatBrokerApiError(revertError));
    } finally {
      setRevertingBanId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Contest exclusions</DialogTitle>
          <DialogDescription>
            Banned participants for{" "}
            <span className="font-medium text-foreground">
              {contest?.name}
            </span>
            . Reverting a ban allows the user to subscribe again.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto py-4">
          {error ? (
            <ApiErrorAlert title="Could not load exclusions" message={error} />
          ) : null}

          {actionError ? (
            <ApiErrorAlert title="Could not revert ban" message={actionError} />
          ) : null}

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Trader ID</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Banned at</TableHead>
                  <TableHead className="w-[72px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loading && bans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No exclusions recorded.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading
                  ? bans.map((ban) => (
                      <TableRow key={ban.id}>
                        <TableCell className="font-medium">
                          {ban.external_user_id}
                        </TableCell>
                        <TableCell>
                          {ban.account?.external_trader_id ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[240px] truncate">
                          {ban.reason}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={ban.is_active ? "destructive" : "secondary"}
                          >
                            {ban.is_active ? "Active" : "Reverted"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatContestDateTime(ban.banned_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {ban.is_active ? (
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip={`Revert ban for ${ban.external_user_id}`}
                              disabled={revertingBanId === ban.id}
                              onClick={() => void handleRevert(ban)}
                            >
                              <Undo2Icon />
                            </ActionTooltipButton>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </div>

        {pagination && pagination.last_page > 1 ? (
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm text-muted-foreground">
              Page {pagination.current_page} of {pagination.last_page}
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
