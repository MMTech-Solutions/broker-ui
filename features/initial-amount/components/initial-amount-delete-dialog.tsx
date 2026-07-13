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
import { deleteInitialAmount } from "@/features/initial-amount/api";
import { formatInitialAmount } from "@/features/initial-amount/format";
import type { InitialAmount } from "@/features/initial-amount/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type InitialAmountDeleteDialogProps = {
  initialAmount: InitialAmount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function InitialAmountDeleteDialog({
  initialAmount,
  open,
  onOpenChange,
  onSuccess,
}: InitialAmountDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!initialAmount) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await deleteInitialAmount(initialAmount.id);
      onOpenChange(false);
      onSuccess();
    } catch (deleteError) {
      setError(formatBrokerApiError(deleteError));
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
          <AlertDialogTitle>Delete default amount</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the default amount of{" "}
            <span className="font-medium text-foreground">
              {initialAmount
                ? formatInitialAmount(initialAmount.amount)
                : "—"}
            </span>{" "}
            from broker-service. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert
            title="Could not delete default amount"
            message={error}
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
          >
            {submitting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
