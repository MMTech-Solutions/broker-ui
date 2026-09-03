"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatReportDate,
  formatReportMoney,
  getIbVolumeRewardTradeRewards,
  type IbVolumeRewardTrade,
  type IbVolumeRewardTradeDetail,
} from "@/features/reports/ib-volume-reward-trades";
import { paymentRuleTypeLabel, paymentStatusLabel, paymentStatusVariant } from "@/features/ib-reward";
import { formatBrokerApiError } from "@/lib/api/errors";

type RewardLinesDialogProps = {
  trade: IbVolumeRewardTrade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function identityLabel(identity: { id: string; name: string | null; email: string | null }): React.ReactNode {
  return (
    <div className="min-w-48">
      <p className="font-medium">{identity.name || identity.id}</p>
      {identity.email ? <p className="text-xs text-muted-foreground">{identity.email}</p> : null}
      <p className="font-mono text-[11px] text-muted-foreground">{identity.id}</p>
    </div>
  );
}

export function RewardLinesDialog({ trade, open, onOpenChange }: RewardLinesDialogProps) {
  const [detail, setDetail] = useState<IbVolumeRewardTradeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !trade) return;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setLoading(true);
      setDetail(null);
      setError(null);

      void getIbVolumeRewardTradeRewards(trade.position_id)
        .then((response) => {
          if (!controller.signal.aborted) setDetail(response.data);
        })
        .catch((cause) => {
          if (!controller.signal.aborted) setError(formatBrokerApiError(cause));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    });

    return () => controller.abort();
  }, [open, trade]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-[min(96rem,calc(100%-2rem))]">
        <DialogHeader>
          <DialogTitle>Volume reward lines</DialogTitle>
          <DialogDescription>
            Position <span className="font-mono">{trade?.position_id ?? "—"}</span>. Paid lines must reconcile with the parent row.
          </DialogDescription>
        </DialogHeader>

        {error ? <ApiErrorAlert title="Could not load reward detail" message={error} /> : null}

        {detail ? (
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant={detail.paid_sum_matches_parent ? "secondary" : "destructive"}>
              {detail.paid_sum_matches_parent ? "Paid sum reconciled" : "Paid sum mismatch"}
            </Badge>
            <span className="text-muted-foreground">Parent paid: {detail.reward_paid}</span>
            <span className="text-muted-foreground">Lines paid: {detail.paid_lines_sum}</span>
            {detail.identity_enrichment_partial ? <Badge variant="outline">Identity data partial</Badge> : null}
          </div>
        ) : null}

        <div className="min-h-0 overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IB</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Benefactor</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead>Basis</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Inputs</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>External txn</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 3 }).map((_, rowIndex) => (
                    <TableRow key={`detail-skeleton-${rowIndex}`}>
                      {Array.from({ length: 16 }).map((__, cellIndex) => (
                        <TableCell key={`${rowIndex}-${cellIndex}`}><Skeleton className="h-4 w-24" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : null}

              {!loading && detail?.rewards.length === 0 ? (
                <TableRow><TableCell colSpan={16} className="h-24 text-center text-muted-foreground">No volume reward lines found.</TableCell></TableRow>
              ) : null}

              {!loading
                ? detail?.rewards.map((reward) => (
                    <TableRow key={reward.id}>
                      <TableCell>{identityLabel(reward.ib)}</TableCell>
                      <TableCell>
                        <p>{reward.program_name || reward.ib_program_id}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{reward.ib_program_id}</p>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{reward.benefactor_id}</TableCell>
                      <TableCell>{reward.level}</TableCell>
                      <TableCell>{paymentRuleTypeLabel(reward.payment_rule_type)}</TableCell>
                      <TableCell>{reward.formula_version || "—"}</TableCell>
                      <TableCell>{reward.calculation_basis || "—"}</TableCell>
                      <TableCell className="text-right">{reward.rate ?? "—"}</TableCell>
                      <TableCell>
                        {reward.calculation_inputs ? (
                          <pre className="max-h-28 min-w-56 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-[11px]">
                            {JSON.stringify(reward.calculation_inputs, null, 2)}
                          </pre>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {formatReportMoney(reward.amount.value, reward.amount.currency_code, reward.amount.currency_precision)}
                      </TableCell>
                      <TableCell><Badge variant={paymentStatusVariant(reward.payment_status)}>{paymentStatusLabel(reward.payment_status)}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{reward.external_transaction_id || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatReportDate(reward.created_at)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatReportDate(reward.updated_at)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatReportDate(reward.paid_at)}</TableCell>
                      <TableCell className="max-w-64 whitespace-normal">{reward.comments || "—"}</TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
