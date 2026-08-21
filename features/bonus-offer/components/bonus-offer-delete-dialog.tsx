"use client";

import { useRef, useState } from "react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { deleteBonusOffer } from "@/features/bonus-offer/api";
import {
  RejectionReasonComposer,
  type RejectionReasonComposerHandle,
} from "@/features/rejection-templates";
import type { BonusOffer } from "@/features/bonus-offer/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type BonusOfferDeleteDialogProps = {
  bonusOffer: BonusOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function BonusOfferDeleteDialog({
  bonusOffer,
  open,
  onOpenChange,
  onSuccess,
}: BonusOfferDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidateAssignments, setInvalidateAssignments] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [publishNotification, setPublishNotification] = useState(true);
  const composerRef = useRef<RejectionReasonComposerHandle>(null);

  async function handleDelete() {
    if (!bonusOffer) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const rejection = invalidateAssignments
        ? await composerRef.current!.prepareSubmit()
        : null;

      await deleteBonusOffer(bonusOffer.id, {
        invalidate_assignments: invalidateAssignments,
        ...(rejection ? { rejection_reason: rejection.body, publish_notification: publishNotification } : {}),
      });
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
          setInvalidateAssignments(true);
          setRejectionReason("");
          setPublishNotification(true);
          composerRef.current?.reset();
        }

        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete bonus offer</AlertDialogTitle>
          <AlertDialogDescription>
            This will soft-delete{" "}
            <span className="font-medium text-foreground">
              {bonusOffer?.name}
            </span>{" "}
            so it leaves the catalog and can no longer be claimed or triggered.
            Open assignments are controlled separately below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5">
          <Checkbox
            id="bonus-offer-delete-invalidate"
            checked={invalidateAssignments}
            onCheckedChange={(checked) =>
              setInvalidateAssignments(checked === true)
            }
            disabled={submitting}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label htmlFor="bonus-offer-delete-invalidate">
              Cancel open assignments
            </Label>
            <p className="text-xs text-muted-foreground leading-snug">
              When enabled, active, queued, and pending-removal assignments are
              cancelled (trading credit removed when applicable). When disabled,
              open assignments keep evaluating with their frozen rules snapshot.
            </p>
          </div>
        </div>

        {invalidateAssignments ? (
          <div className="space-y-4">
            <RejectionReasonComposer
              ref={composerRef}
              category="bonuses"
              value={rejectionReason}
              onChange={setRejectionReason}
              disabled={submitting}
              bodyLabel="Cancellation reason"
              bodyRequired
              bodyMaxLength={1000}
              open={open}
              idPrefix="bonus-offer-delete-rejection"
            />
            <div className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5">
              <Checkbox id="bonus-delete-send-notification" checked={publishNotification} onCheckedChange={(checked) => setPublishNotification(checked === true)} disabled={submitting} className="mt-0.5" />
              <div className="space-y-1">
                <Label htmlFor="bonus-delete-send-notification">Send email notification</Label>
                <p className="text-xs leading-snug text-muted-foreground">Publish the cancellation event for Notification Center.</p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <ApiErrorAlert title="Could not delete bonus offer" message={error} />
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
