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
import { deleteIbProgram } from "@/features/ib-program/api";
import type { IbProgram } from "@/features/ib-program/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbProgramDeleteDialogProps = {
  ibProgram: IbProgram | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function IbProgramDeleteDialog({
  ibProgram,
  open,
  onOpenChange,
  onSuccess,
}: IbProgramDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!ibProgram) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await deleteIbProgram(ibProgram.id);
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
          <AlertDialogTitle>Delete IB program</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{" "}
            <span className="font-medium text-foreground">
              {ibProgram?.name}
            </span>{" "}
            from broker-service. Programs with active plan subscriptions cannot
            be deleted. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert title="Could not delete IB program" message={error} />
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
