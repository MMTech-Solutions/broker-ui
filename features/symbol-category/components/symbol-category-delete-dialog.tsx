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
import { deleteSymbolCategory } from "@/features/symbol-category/api";
import type { SymbolCategory } from "@/features/symbol-category/types";
import { BrokerApiError, formatBrokerApiError } from "@/lib/api/errors";

type SymbolCategoryDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: SymbolCategory | null;
  onSuccess: () => void;
};

export function SymbolCategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: SymbolCategoryDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset transient API errors whenever a new delete interaction starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setError(null);
  }, [open, category]);

  async function handleDelete() {
    if (!category) return;

    setSubmitting(true);
    setError(null);

    try {
      await deleteSymbolCategory(category.id);
      onOpenChange(false);
      onSuccess();
    } catch (deleteError) {
      if (
        deleteError instanceof BrokerApiError &&
        deleteError.code === "SYMBOL_CATEGORY_HAS_SYMBOLS"
      ) {
        setError("Reassign or uncategorize its symbols before deleting this category.");
      } else {
        setError(formatBrokerApiError(deleteError));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete symbol category?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This will permanently delete ${category?.name ?? "this category"}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert title="Could not delete category" message={error} />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
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
