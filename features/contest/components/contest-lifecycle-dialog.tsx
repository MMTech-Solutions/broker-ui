"use client";

import { useState } from "react";

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
import { activateContest, cancelContest } from "@/features/contest/api";
import type { Contest } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ContestLifecycleDialogProps = {
  contest: Contest | null;
  action: "activate" | "cancel" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ContestLifecycleDialog({
  contest,
  action,
  open,
  onOpenChange,
  onSuccess,
}: ContestLifecycleDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!contest || !action) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (action === "activate") {
        await activateContest(contest.id);
      } else {
        await cancelContest(contest.id);
      }

      onOpenChange(false);
      onSuccess();
    } catch (confirmError) {
      setError(formatBrokerApiError(confirmError));
    } finally {
      setSubmitting(false);
    }
  }

  const isActivate = action === "activate";

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
          <AlertDialogTitle>
            {isActivate ? "Activate contest" : "Cancel contest"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActivate ? (
              <>
                This will move{" "}
                <span className="font-medium text-foreground">
                  {contest?.name}
                </span>{" "}
                from draft to upcoming status.
              </>
            ) : (
              <>
                This will cancel{" "}
                <span className="font-medium text-foreground">
                  {contest?.name}
                </span>
                . Active subscriptions may be refunded depending on contest
                rules.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert
            title={
              isActivate
                ? "Could not activate contest"
                : "Could not cancel contest"
            }
            message={error}
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Close</AlertDialogCancel>
          <AlertDialogAction
            variant={isActivate ? "default" : "destructive"}
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {submitting
              ? isActivate
                ? "Activating..."
                : "Cancelling..."
              : isActivate
                ? "Activate"
                : "Cancel contest"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
