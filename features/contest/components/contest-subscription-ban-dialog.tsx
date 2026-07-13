"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { storeContestBan } from "@/features/contest/api";
import type { Contest, ContestSubscription } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ContestSubscriptionBanDialogProps = {
  contest: Contest | null;
  subscription: ContestSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ContestSubscriptionBanDialog({
  contest,
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: ContestSubscriptionBanDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason("");
    setError(null);
  }, [open, subscription]);

  async function handleBan() {
    if (!contest || !subscription) {
      return;
    }

    if (!reason.trim()) {
      setError("Reason is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await storeContestBan(contest.id, {
        external_user_id: subscription.external_user_id,
        account_id: subscription.account_id,
        reason: reason.trim(),
      });

      onOpenChange(false);
      onSuccess();
    } catch (banError) {
      setError(formatBrokerApiError(banError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setError(null);
        }

        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Exclude participant</AlertDialogTitle>
          <AlertDialogDescription>
            This will ban{" "}
            <span className="font-medium text-foreground">
              {subscription?.external_user_id}
            </span>{" "}
            from{" "}
            <span className="font-medium text-foreground">
              {contest?.name}
            </span>{" "}
            and remove their active subscription without refunding the entry
            fee.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="contest-ban-reason">Reason</Label>
          <textarea
            id="contest-ban-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={submitting}
            rows={4}
            className={cn(
              "flex min-h-24 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
            )}
            placeholder="Describe why this participant is being excluded"
          />
        </div>

        {error ? (
          <ApiErrorAlert title="Could not exclude participant" message={error} />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void handleBan();
            }}
          >
            {submitting ? "Excluding..." : "Exclude participant"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
