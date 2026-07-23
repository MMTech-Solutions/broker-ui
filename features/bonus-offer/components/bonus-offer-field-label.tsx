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
  server_groups:
    "Select at least one server group for this platform. All selected groups must share the same currency precision so monetary amounts can be converted safely.",
  credit_amount:
    "Fixed bonus credit amount in major currency units (e.g. 100.00 USD) granted when the trader claims a manual_claim offer. Converted to minor units using the selected server groups' currency precision.",
  deposit_percent:
    "Percentage of the deposited amount used to calculate bonus credit for deposit_triggered offers.",
  max_credit_amount:
    "Maximum bonus credit cap in major currency units applied per qualifying deposit. Converted to minor units using the selected server groups' currency precision.",
  deposit_application_mode:
    "Once per account grants the bonus only the first time; per deposit grants it on every qualifying deposit.",
  introducing_brokers:
    "Active IB partners linked to this deposit offer. Traders whose direct referrer is one of these IBs receive this offer instead of the default. Leave empty to keep this as the system default deposit offer (only one default is allowed).",
  claim_expires_at:
    "Deadline after which manual claims are no longer accepted. Leave empty for no expiration.",
  min_real_balance:
    "Minimum real (non-bonus) balance in major currency units. Use 0 or empty for no requirement. When greater than 0, the account must meet this threshold to appear as eligible, claim manually, or receive a deposit-triggered bonus (checked against balance after the triggering deposit is credited).",
  min_deposit_amount:
    "Minimum lifetime paid external deposits in major currency units. Use 0 for no requirement. When greater than 0, the account must meet this threshold to appear as eligible, claim manually, or receive a deposit-triggered bonus.",
  min_position_duration_seconds:
    "Minimum seconds a closed position must remain open to count toward bonus activity. Use 0 for no requirement. Positions with (close time − open time) below this value are ignored.",
  conversion_window_days:
    "Number of days from bonus activation during which the trader must reach the activity threshold to convert credit into real balance.",
  activity_per_credit_unit:
    "Major units of bonus credit covered by one unit of closed trading volume (legacy lotperunit). Stored as integer minor credit per volume using the server groups' currency precision. Required activity = credited amount (minor) ÷ stored value.",
  is_active:
    "Inactive offers cannot be claimed manually nor triggered by deposits until reactivated. Deactivating requires choosing whether open assignments are cancelled or kept on their rules snapshot.",
  invalidate_assignments:
    "Cancel open assignments (active, queued, pending removal) when deactivating. Active/pending-removal credit is removed from trading; queued assignments are only invalidated. If disabled, open assignments keep evaluating with their frozen rules snapshot.",
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
