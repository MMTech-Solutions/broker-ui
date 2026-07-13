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
import { deleteIbPaymentTemplateLevel } from "@/features/ib-payment-template/api";
import type {
  IbPaymentTemplate,
  IbPaymentTemplateLevel,
} from "@/features/ib-payment-template/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbPaymentTemplateLevelDeleteDialogProps = {
  ibPaymentTemplate: IbPaymentTemplate | null;
  level: IbPaymentTemplateLevel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function IbPaymentTemplateLevelDeleteDialog({
  ibPaymentTemplate,
  level,
  open,
  onOpenChange,
  onSuccess,
}: IbPaymentTemplateLevelDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete =
    (ibPaymentTemplate?.levels?.length ?? 0) > 1 ||
    (level && (ibPaymentTemplate?.levels?.length ?? 0) > 1);

  async function handleDelete() {
    if (!ibPaymentTemplate || !level) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await deleteIbPaymentTemplateLevel(ibPaymentTemplate.id, level.id);
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
          <AlertDialogTitle>Delete payment level</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove level{" "}
            <span className="font-medium text-foreground">{level?.name}</span>{" "}
            from{" "}
            <span className="font-medium text-foreground">
              {ibPaymentTemplate?.name}
            </span>
            . Each template must keep at least one level.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert title="Could not delete payment level" message={error} />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={submitting || !canDelete}
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
