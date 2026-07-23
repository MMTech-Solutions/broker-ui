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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateTradingAccount } from "@/features/trading-account/api";
import type {
  TradingAccount,
  UpdateTradingAccountInput,
} from "@/features/trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

export type TradingAccountAccessAction =
  | "disable_trading"
  | "enable_trading"
  | "deactivate_account"
  | "reactivate_account";

type TradingAccountAccessDialogProps = {
  account: TradingAccount | null;
  action: TradingAccountAccessAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const RESTRICTING_ACTIONS: TradingAccountAccessAction[] = [
  "disable_trading",
  "deactivate_account",
];

const ACTION_COPY: Record<
  TradingAccountAccessAction,
  {
    title: string;
    description: (traderId: string) => string;
    confirmLabel: string;
    payload: UpdateTradingAccountInput;
  }
> = {
  disable_trading: {
    title: "Disable trading",
    description: (traderId) =>
      `Disable trading for account ${traderId}? The account can still log in, but cannot open or close trades.`,
    confirmLabel: "Disable trading",
    payload: { is_trading_enabled: false },
  },
  enable_trading: {
    title: "Enable trading",
    description: (traderId) =>
      `Enable trading for account ${traderId}?`,
    confirmLabel: "Enable trading",
    payload: { is_trading_enabled: true },
  },
  deactivate_account: {
    title: "Deactivate account",
    description: (traderId) =>
      `Deactivate account ${traderId}? The account will be blocked on the trading platform (no login).`,
    confirmLabel: "Deactivate",
    payload: { is_active: false },
  },
  reactivate_account: {
    title: "Reactivate account",
    description: (traderId) =>
      `Reactivate account ${traderId}? Platform access will be restored according to its trading flag.`,
    confirmLabel: "Reactivate",
    payload: { is_active: true },
  },
};

export function TradingAccountAccessDialog({
  account,
  action,
  open,
  onOpenChange,
  onSuccess,
}: TradingAccountAccessDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closeOpenPositions, setCloseOpenPositions] = useState(false);

  const copy = action ? ACTION_COPY[action] : null;
  const showClosePositionsOption =
    action !== null && RESTRICTING_ACTIONS.includes(action);

  async function handleConfirm() {
    if (!account || !action || !copy) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: UpdateTradingAccountInput = {
        ...copy.payload,
        ...(showClosePositionsOption
          ? { close_open_positions: closeOpenPositions }
          : {}),
      };

      await updateTradingAccount(account.id, payload);
      onOpenChange(false);
      onSuccess();
    } catch (confirmError) {
      setError(formatBrokerApiError(confirmError));
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
          setCloseOpenPositions(false);
        }

        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy?.title ?? "Confirm"}</AlertDialogTitle>
          <AlertDialogDescription>
            {account && copy
              ? copy.description(account.external_trader_id)
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {showClosePositionsOption ? (
          <div className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5">
            <Checkbox
              id="close-open-positions"
              checked={closeOpenPositions}
              onCheckedChange={(checked) =>
                setCloseOpenPositions(checked === true)
              }
              disabled={submitting}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor="close-open-positions">Close open positions</Label>
              <p className="text-xs leading-snug text-muted-foreground">
                When enabled, all open positions on the trading platform are
                closed before restricting access. When disabled, open positions
                remain and keep being affected by the market.
              </p>
            </div>
          </div>
        ) : null}

        {error ? (
          <ApiErrorAlert title="Could not update account" message={error} />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting || !account || !action}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {submitting ? "Saving…" : (copy?.confirmLabel ?? "Confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
