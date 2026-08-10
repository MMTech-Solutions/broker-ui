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
import { deleteRejectionTemplate } from "@/features/rejection-templates/api";
import {
  rejectionTemplateCategoryLabel,
  type RejectionTemplate,
} from "@/features/rejection-templates/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type RejectionTemplateDeleteDialogProps = {
  template: RejectionTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function RejectionTemplateDeleteDialog({
  template,
  open,
  onOpenChange,
  onSuccess,
}: RejectionTemplateDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!template) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await deleteRejectionTemplate(template.id);
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
          <AlertDialogTitle>Delete rejection template</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{" "}
            <span className="font-medium text-foreground">
              {template?.title}
            </span>{" "}
            ({rejectionTemplateCategoryLabel(template?.category)}). Past
            rejections already store a text copy and are not affected.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert title="Could not delete template" message={error} />
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
