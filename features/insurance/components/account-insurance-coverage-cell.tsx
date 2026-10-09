"use client";

import type { AccountInsurance } from "@/features/insurance/types";
import { resolveDisplayedInsuranceAmount } from "@/features/insurance/types";
import { cn } from "@/lib/utils";

type AccountInsuranceCoverageCellProps = {
  insurance: AccountInsurance;
  formatAmount: (value: string | number | null | undefined) => string;
  /** Secondary label under the amount (e.g. remaining to cap). */
  remainingLabel?: (remainingFormatted: string) => string;
  className?: string;
};

export function AccountInsuranceCoverageCell({
  insurance,
  formatAmount,
  remainingLabel,
  className,
}: AccountInsuranceCoverageCellProps) {
  const displayed = resolveDisplayedInsuranceAmount(insurance);
  const amountLabel = formatAmount(displayed.amount);
  const insuredLabel = formatAmount(insurance.insured_amount);
  const remainingFormatted =
    displayed.remainingInsuredAmount != null
      ? formatAmount(displayed.remainingInsuredAmount)
      : null;
  const progressPercent = Math.round(displayed.coverageProgress * 100);

  return (
    <div className={cn("flex min-w-[140px] flex-col gap-1", className)}>
      <span className="tabular-nums">
        {amountLabel}
        <span className="text-muted-foreground"> / {insuredLabel}</span>
      </span>
      {displayed.showProgress ? (
        <>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            title={`${progressPercent}% of ${insuredLabel} insured`}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {remainingFormatted != null && remainingLabel ? (
            <span className="text-xs text-muted-foreground">
              {remainingLabel(remainingFormatted)}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
