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
import { deleteInsurancePlanOption } from "@/features/insurance/api";
import type {
  InsurancePlan,
  InsurancePlanOption,
} from "@/features/insurance/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type InsurancePlanOptionDeleteDialogProps = {
  insurancePlan: InsurancePlan | null;
  option: InsurancePlanOption | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function InsurancePlanOptionDeleteDialog({
  insurancePlan,
  option,
  open,
  onOpenChange,
  onSuccess,
}: InsurancePlanOptionDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!insurancePlan || !option) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await deleteInsurancePlanOption(insurancePlan.id, option.id);
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
          <AlertDialogTitle>Delete plan option</AlertDialogTitle>
          <AlertDialogDescription>
            Remove option with {option?.coverage_percentage}% coverage from{" "}
            <span className="font-medium text-foreground">
              {insurancePlan?.name}
            </span>
            . Options linked to account insurances cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert
            title="Could not delete plan option"
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
