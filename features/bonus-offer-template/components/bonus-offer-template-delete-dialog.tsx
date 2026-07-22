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
import { deleteBonusOfferTemplate } from "@/features/bonus-offer-template/api";
import type { BonusOfferTemplate } from "@/features/bonus-offer-template/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type BonusOfferTemplateDeleteDialogProps = {
  bonusOfferTemplate: BonusOfferTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function BonusOfferTemplateDeleteDialog({
  bonusOfferTemplate,
  open,
  onOpenChange,
  onSuccess,
}: BonusOfferTemplateDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!bonusOfferTemplate) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await deleteBonusOfferTemplate(bonusOfferTemplate.id);
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
          <AlertDialogTitle>Delete bonus offer template</AlertDialogTitle>
          <AlertDialogDescription>
            This will soft-delete{" "}
            <span className="font-medium text-foreground">
              {bonusOfferTemplate?.name}
            </span>
            . Existing bonus offers created from this template are not affected;
            the template can no longer seed new offers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert
            title="Could not delete bonus offer template"
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
