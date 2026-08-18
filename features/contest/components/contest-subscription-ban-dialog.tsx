"use client";

import { useEffect, useRef, useState } from "react";

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
import { storeContestBan } from "@/features/contest/api";
import {
  resolveContestSubscriptionOwner,
  type Contest,
  type ContestSubscription,
} from "@/features/contest/types";
import {
  RejectionReasonComposer,
  type RejectionReasonComposerHandle,
} from "@/features/rejection-templates";
import { formatBrokerApiError } from "@/lib/api/errors";

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
  const composerRef = useRef<RejectionReasonComposerHandle>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason("");
    setError(null);
    composerRef.current?.reset();
  }, [open, subscription]);

  async function handleBan() {
    if (!subscription) {
      return;
    }

    const contestId = contest?.id ?? subscription.contest_id;
    if (!contestId) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const owner = resolveContestSubscriptionOwner(subscription);

    try {
      const { body } = await composerRef.current!.prepareSubmit();

      await storeContestBan(contestId, {
        external_user_id: owner.id ?? "",
        account_id: subscription.account_id,
        reason: body,
      });

      onOpenChange(false);
      onSuccess();
    } catch (banError) {
      setError(formatBrokerApiError(banError));
    } finally {
      setSubmitting(false);
    }
  }

  const ownerLabel = subscription
    ? (() => {
        const owner = resolveContestSubscriptionOwner(subscription);
        return owner.name || owner.id || "—";
      })()
    : "";

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
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Exclude participant</AlertDialogTitle>
          <AlertDialogDescription>
            This will ban{" "}
            <span className="font-medium text-foreground">
              {ownerLabel}
            </span>{" "}
            from{" "}
            <span className="font-medium text-foreground">
              {contest?.name ?? subscription?.contest?.name ?? "this contest"}
            </span>{" "}
            and remove their active subscription without refunding the entry
            fee.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <RejectionReasonComposer
          ref={composerRef}
          category="contests"
          open={open}
          value={reason}
          onChange={setReason}
          disabled={submitting}
          bodyLabel="Reason"
          bodyRequired
          bodyMaxLength={1000}
          bodyPlaceholder="Describe why this participant is being excluded"
          idPrefix="contest-ban"
        />

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
