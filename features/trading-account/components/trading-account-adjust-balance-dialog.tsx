"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adjustTradingAccountBalance } from "@/features/trading-account/api";
import type { TradingAccount } from "@/features/trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type TradingAccountAdjustBalanceDialogProps = {
  account: TradingAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function TradingAccountAdjustBalanceDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: TradingAccountAdjustBalanceDialogProps) {
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setComment("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const currencyCode = account?.server_group.currency.code ?? "—";
  const precision = account?.server_group.currency.precision ?? 2;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!account) {
      return;
    }

    const trimmedAmount = amount.trim();
    const trimmedComment = comment.trim();

    if (!trimmedAmount || !/^-?\d+(\.\d+)?$/.test(trimmedAmount)) {
      setError("Enter a signed decimal amount (e.g. 50.00 or -12.5).");
      return;
    }

    if (Number(trimmedAmount) === 0) {
      setError("Amount must not be zero.");
      return;
    }

    if (!trimmedComment) {
      setError("Comment is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await adjustTradingAccountBalance(account.id, {
        amount: trimmedAmount,
        comment: trimmedComment,
      });
      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust balance</DialogTitle>
          <DialogDescription>
            Relative MT balance adjustment for login{" "}
            <span className="font-medium text-foreground">
              {account?.external_trader_id ?? "—"}
            </span>
            . Positive credits balance; negative debits balance. Does not touch
            bonus credit. Currency: {currencyCode} (precision {precision}).
            Current balance:{" "}
            {account != null
              ? new Intl.NumberFormat(undefined, {
                  minimumFractionDigits: precision,
                  maximumFractionDigits: precision,
                }).format(account.current_balance)
              : "—"}
            .
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <ApiErrorAlert title="Could not adjust balance" message={error} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="adjust-balance-amount">Amount (major units)</Label>
            <Input
              id="adjust-balance-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="50.00 or -12.50"
              disabled={submitting}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-balance-comment">Comment</Label>
            <Input
              id="adjust-balance-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Reason for adjustment"
              disabled={submitting}
              maxLength={255}
            />
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
            <Button type="submit" disabled={submitting || !account}>
              {submitting ? "Saving..." : "Apply adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
