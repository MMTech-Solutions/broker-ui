"use client";

import { useRef, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cancelBonusAssignment } from "@/features/bonus-assignment-logs/api";
import type { BonusAssignment } from "@/features/bonus-assignment-logs/types";
import { RejectionReasonComposer, type RejectionReasonComposerHandle } from "@/features/rejection-templates";
import { formatBrokerApiError } from "@/lib/api/errors";

type CancelBonusAssignmentDialogProps = {
  assignment: BonusAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function CancelBonusAssignmentDialog({ assignment, open, onOpenChange, onSuccess }: CancelBonusAssignmentDialogProps) {
  const composerRef = useRef<RejectionReasonComposerHandle>(null);
  const [reason, setReason] = useState("");
  const [publishNotification, setPublishNotification] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!assignment) return;
    setSubmitting(true);
    setError(null);
    try {
      const { body } = await composerRef.current!.prepareSubmit();
      await cancelBonusAssignment(assignment.id, { rejection_reason: body, publish_notification: publishNotification });
      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!next) { setReason(""); setPublishNotification(true); setError(null); composerRef.current?.reset(); } onOpenChange(next); }}>
    <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Cancel bonus assignment</DialogTitle>
        <DialogDescription>This cancels the bonus and removes its trading credit when applicable. This action cannot be undone.</DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2">
        {error ? <ApiErrorAlert title="Could not cancel bonus assignment" message={error} /> : null}
        <RejectionReasonComposer ref={composerRef} category="bonuses" value={reason} onChange={setReason} disabled={submitting} bodyLabel="Cancellation reason" bodyRequired bodyMaxLength={1000} open={open} idPrefix="bonus-assignment-cancellation" />
        <div className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5">
          <Checkbox id="bonus-assignment-send-notification" checked={publishNotification} onCheckedChange={(checked) => setPublishNotification(checked === true)} disabled={submitting} className="mt-0.5" />
          <div className="space-y-1"><Label htmlFor="bonus-assignment-send-notification">Send email notification</Label><p className="text-xs leading-snug text-muted-foreground">Publish the cancellation event for Notification Center.</p></div>
        </div>
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button><Button type="button" variant="destructive" onClick={() => void submit()} disabled={submitting || !assignment}>{submitting ? "Cancelling..." : "Cancel bonus"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
