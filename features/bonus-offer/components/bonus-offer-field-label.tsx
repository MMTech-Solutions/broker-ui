"use client";

import type { ReactNode } from "react";
import { CircleHelpIcon } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const BONUS_OFFER_FIELD_HELP = {
  type: "How the bonus is granted: manual claim by the trader, or automatically when a qualifying deposit is credited.",
  name: "Administrative name used to identify this offer in lists and configuration screens.",
  template:
    "Optional reusable template. When selected, conversion rules and excluded instruments are copied from the template instead of entering platform and conversion fields manually.",
  platform:
    "Trading platform where eligible accounts must belong. Server groups linked to the offer must match this platform.",
  credit_amount:
    "Fixed bonus credit amount in minor currency units (e.g. cents) granted when the trader claims a manual_claim offer.",
  deposit_percent:
    "Percentage of the deposited amount used to calculate bonus credit for deposit_triggered offers.",
  max_credit_amount:
    "Maximum bonus credit cap in minor currency units applied per qualifying deposit.",
  deposit_application_mode:
    "Once per account grants the bonus only the first time; per deposit grants it on every qualifying deposit.",
  claim_expires_at:
    "Deadline after which manual claims are no longer accepted. Leave empty for no expiration.",
  min_real_balance:
    "Minimum real (non-bonus) balance in minor currency units. Use 0 or empty for no requirement. When greater than 0, the account must meet this threshold to appear as eligible, claim manually, or receive a deposit-triggered bonus (checked against balance after the triggering deposit is credited).",
  min_deposit_amount:
    "Minimum lifetime paid external deposits in minor currency units. Use 0 for no requirement. When greater than 0, the account must meet this threshold to appear as eligible, claim manually, or receive a deposit-triggered bonus.",
  min_position_duration_seconds:
    "Minimum seconds a closed position must remain open to count toward bonus activity. Use 0 for no requirement. Positions with (close time − open time) below this value are ignored.",
  conversion_window_days:
    "Number of days from bonus activation during which the trader must reach the activity threshold to convert credit into real balance.",
  activity_per_credit_unit:
    "Closed trading volume required per one unit of credited bonus. Required activity = credited amount ÷ this value.",
  is_active:
    "Inactive offers cannot be claimed manually nor triggered by deposits until reactivated.",
  burn_on_withdrawal:
    "If enabled, an active bonus is cancelled immediately when the trader withdraws funds from the account.",
  burn_on_negative_balance:
    "If enabled, an active bonus is cancelled when effective equity drops to zero or below.",
} as const;

type BonusOfferFieldLabelProps = {
  htmlFor: string;
  help: string;
  children: ReactNode;
};

export function BonusOfferFieldLabel({
  htmlFor,
  help,
  children,
}: BonusOfferFieldLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className="inline-flex shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`Help: ${typeof children === "string" ? children : help}`}
            >
              <CircleHelpIcon className="size-3.5" />
            </button>
          }
        />
        <TooltipContent
          side="top"
          className="max-w-xs text-left leading-snug whitespace-normal"
        >
          {help}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
