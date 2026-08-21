"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TradingAccount } from "@/features/trading-account/types";

type TradingAccountNotesDialogProps = {
  account: TradingAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fields: Array<{
  key: keyof Pick<
    TradingAccount,
    "comments" | "cancellation_reason" | "trading_disabled_reason"
  >;
  label: string;
}> = [
  { key: "comments", label: "Comments" },
  { key: "cancellation_reason", label: "Deactivation reason" },
  { key: "trading_disabled_reason", label: "Trading-disabled reason" },
];

export function TradingAccountNotesDialog({
  account,
  open,
  onOpenChange,
}: TradingAccountNotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Account notes and reasons</DialogTitle>
          <DialogDescription>
            {account ? `Trading account ${account.external_trader_id}` : ""}
          </DialogDescription>
        </DialogHeader>
        <dl className="space-y-4 text-sm">
          {fields.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <dt className="font-medium">{label}</dt>
              <dd className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-muted-foreground">
                {account?.[key]?.trim() || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
