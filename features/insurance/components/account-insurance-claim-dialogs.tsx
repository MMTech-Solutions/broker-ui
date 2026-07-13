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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { rejectAccountInsuranceClaim } from "@/features/insurance/api";
import type { AccountInsurance } from "@/features/insurance/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type AccountInsuranceRejectDialogProps = {
  accountInsurance: AccountInsurance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function AccountInsuranceRejectDialog({
  accountInsurance,
  open,
  onOpenChange,
  onSuccess,
}: AccountInsuranceRejectDialogProps) {
  const [notes, setNotes] = useState("");
  const [publishNotification, setPublishNotification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReject() {
    if (!accountInsurance) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await rejectAccountInsuranceClaim(accountInsurance.id, {
        notes: notes.trim() || null,
        publish_notification: publishNotification,
      });
      onOpenChange(false);
      setNotes("");
      setPublishNotification(false);
      onSuccess();
    } catch (rejectError) {
      setError(formatBrokerApiError(rejectError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setError(null);
          setNotes("");
          setPublishNotification(false);
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject insurance claim</DialogTitle>
          <DialogDescription>
            Reject the pending claim for account insurance{" "}
            <span className="font-mono text-xs text-foreground">
              {accountInsurance?.id.slice(0, 8)}…
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <ApiErrorAlert
              title="Could not reject insurance claim"
              message={error}
            />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="reject-notes">Notes</Label>
            <textarea
              id="reject-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={submitting}
              rows={3}
              placeholder="Optional rejection reason"
              className={cn(
                "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="reject-publish-notification"
              checked={publishNotification}
              onCheckedChange={(checked) =>
                setPublishNotification(checked === true)
              }
              disabled={submitting}
            />
            <Label htmlFor="reject-publish-notification">
              Publish notification to user
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={submitting}
            onClick={() => void handleReject()}
          >
            {submitting ? "Rejecting..." : "Reject claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type AccountInsuranceApproveDialogProps = {
  accountInsurance: AccountInsurance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onApprove: (accountInsuranceId: string) => Promise<void>;
};

export function AccountInsuranceApproveDialog({
  accountInsurance,
  open,
  onOpenChange,
  onSuccess,
  onApprove,
}: AccountInsuranceApproveDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (!accountInsurance) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onApprove(accountInsurance.id);
      onOpenChange(false);
      onSuccess();
    } catch (approveError) {
      setError(formatBrokerApiError(approveError));
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
          <AlertDialogTitle>Approve insurance claim</AlertDialogTitle>
          <AlertDialogDescription>
            Approve the pending claim and credit compensation for{" "}
            <span className="font-medium text-foreground">
              {accountInsurance?.plan?.name ?? "this insurance"}
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert
            title="Could not approve insurance claim"
            message={error}
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void handleApprove();
            }}
          >
            {submitting ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
