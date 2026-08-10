"use client";

import { useEffect, useRef, useState } from "react";

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
import {
  RejectionReasonComposer,
  type RejectionReasonComposerHandle,
} from "@/features/rejection-templates";
import { formatBrokerApiError } from "@/lib/api/errors";

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
  const composerRef = useRef<RejectionReasonComposerHandle>(null);
  const [notes, setNotes] = useState("");
  const [publishNotification, setPublishNotification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setNotes("");
    setPublishNotification(false);
    setError(null);
    composerRef.current?.reset();
  }, [open, accountInsurance]);

  async function handleReject() {
    if (!accountInsurance) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { body } = await composerRef.current!.prepareSubmit();

      await rejectAccountInsuranceClaim(accountInsurance.id, {
        notes: body || null,
        publish_notification: publishNotification,
      });
      onOpenChange(false);
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

          <RejectionReasonComposer
            ref={composerRef}
            category="insurance"
            open={open}
            value={notes}
            onChange={setNotes}
            disabled={submitting}
            bodyLabel="Notes"
            bodyRequired={false}
            bodyMaxLength={2000}
            bodyPlaceholder="Optional rejection reason"
            idPrefix="insurance-reject"
          />

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
