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
import { seedIbDemoCatalog } from "@/features/ib-plan/api";
import type { IbDemoCatalog } from "@/features/ib-plan/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbDemoCatalogSeedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (catalog: IbDemoCatalog) => void;
};

export function IbDemoCatalogSeedDialog({
  open,
  onOpenChange,
  onSuccess,
}: IbDemoCatalogSeedDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await seedIbDemoCatalog();
      onOpenChange(false);
      onSuccess(response.data);
    } catch (seedError) {
      setError(formatBrokerApiError(seedError));
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
          <AlertDialogTitle>Load starter catalog</AlertDialogTitle>
          <AlertDialogDescription>
            This creates one inactive plan (
            <span className="font-medium text-foreground">IB Career Path</span>
            ), two programs, three payment templates (1, 3, and 5 levels), and
            active Volume, PnL, and CPA rules on each program. Symbols are not
            configured. If IB Career Path already exists, nothing is duplicated.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert
            title="Could not load starter catalog"
            message={error}
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void handleSeed();
            }}
          >
            {submitting ? "Loading..." : "Load catalog"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
