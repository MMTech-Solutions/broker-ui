"use client";

import {
  KeyRoundIcon,
  LineChartIcon,
  MessageSquareTextIcon,
  LockIcon,
  MoreHorizontalIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  UnlockIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TradingAccountAccessAction } from "@/features/trading-account/components/trading-account-access-dialog";
import type { TradingAccount } from "@/features/trading-account/types";

type TradingAccountActionsMenuProps = {
  account: TradingAccount;
  onViewPositions: (account: TradingAccount) => void;
  onResetPassword: (account: TradingAccount) => void;
  onViewNotes: (account: TradingAccount) => void;
  onAccessAction: (
    account: TradingAccount,
    action: TradingAccountAccessAction,
  ) => void;
};

export function TradingAccountActionsMenu({
  account,
  onViewPositions,
  onResetPassword,
  onViewNotes,
  onAccessAction,
}: TradingAccountActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Actions for ${account.external_trader_id}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewPositions(account)}>
          <LineChartIcon />
          View positions
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onResetPassword(account)}>
          <KeyRoundIcon />
          Reset password
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onViewNotes(account)}>
          <MessageSquareTextIcon />
          View comments and reasons
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {account.is_trading_enabled ? (
          <DropdownMenuItem
            disabled={!account.is_active}
            onClick={() => onAccessAction(account, "disable_trading")}
          >
            <PauseCircleIcon />
            Disable trading
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={!account.is_active}
            onClick={() => onAccessAction(account, "enable_trading")}
          >
            <PlayCircleIcon />
            Enable trading
          </DropdownMenuItem>
        )}

        {account.is_active ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onAccessAction(account, "deactivate_account")}
          >
            <LockIcon />
            Deactivate account
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onAccessAction(account, "reactivate_account")}
          >
            <UnlockIcon />
            Reactivate account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
