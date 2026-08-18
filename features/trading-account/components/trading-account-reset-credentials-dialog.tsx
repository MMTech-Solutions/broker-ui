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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetTradingAccountCredentials,
  type ResetTradingAccountCredentialsInput,
} from "@/features/trading-account/api";
import type { TradingAccount } from "@/features/trading-account/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type TradingAccountResetCredentialsDialogProps = {
  account: TradingAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

const MIN_PASSWORD_LENGTH = 8;

export function TradingAccountResetCredentialsDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: TradingAccountResetCredentialsDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMaster, setResetMaster] = useState(true);
  const [resetInvestor, setResetInvestor] = useState(true);
  const [masterPassword, setMasterPassword] = useState("");
  const [investorPassword, setInvestorPassword] = useState("");

  function resetForm() {
    setError(null);
    setResetMaster(true);
    setResetInvestor(true);
    setMasterPassword("");
    setInvestorPassword("");
  }

  function validateForm(): string | null {
    if (!resetMaster && !resetInvestor) {
      return "Select at least one password to reset.";
    }

    if (
      resetMaster &&
      masterPassword.trim() !== "" &&
      masterPassword.trim().length < MIN_PASSWORD_LENGTH
    ) {
      return `Master password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (
      resetInvestor &&
      investorPassword.trim() !== "" &&
      investorPassword.trim().length < MIN_PASSWORD_LENGTH
    ) {
      return `Investor password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    return null;
  }

  async function handleConfirm() {
    if (!account) {
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const input: ResetTradingAccountCredentialsInput = {
      reset_password: resetMaster,
      reset_investor_password: resetInvestor,
    };

    if (resetMaster && masterPassword.trim() !== "") {
      input.password = masterPassword.trim();
    }

    if (resetInvestor && investorPassword.trim() !== "") {
      input.investor_password = investorPassword.trim();
    }

    try {
      await resetTradingAccountCredentials(account.id, input);
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
          resetForm();
        }

        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset password</AlertDialogTitle>
          <AlertDialogDescription>
            {account
              ? `Reset credentials for account ${account.external_trader_id}? Only checked identities are changed. Leave a field empty to auto-generate, or type a value to use it. New credentials will be emailed to the account owner. Existing terminal sessions will stop working.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Checkbox
                id="reset-master-password"
                checked={resetMaster}
                onCheckedChange={(checked) => {
                  const enabled = checked === true;
                  setResetMaster(enabled);
                  if (!enabled) {
                    setMasterPassword("");
                  }
                }}
                disabled={submitting}
                className="mt-0.5"
              />
              <Label htmlFor="reset-master-password">
                Reset master password
              </Label>
            </div>
            <Input
              id="master-password"
              type="text"
              autoComplete="off"
              placeholder="Leave empty to auto-generate"
              value={masterPassword}
              disabled={submitting || !resetMaster}
              onChange={(event) => setMasterPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Checkbox
                id="reset-investor-password"
                checked={resetInvestor}
                onCheckedChange={(checked) => {
                  const enabled = checked === true;
                  setResetInvestor(enabled);
                  if (!enabled) {
                    setInvestorPassword("");
                  }
                }}
                disabled={submitting}
                className="mt-0.5"
              />
              <Label htmlFor="reset-investor-password">
                Reset investor password
              </Label>
            </div>
            <Input
              id="investor-password"
              type="text"
              autoComplete="off"
              placeholder="Leave empty to auto-generate"
              value={investorPassword}
              disabled={submitting || !resetInvestor}
              onChange={(event) => setInvestorPassword(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <ApiErrorAlert
            title="Could not reset password"
            message={error}
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting || !account || (!resetMaster && !resetInvestor)}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {submitting ? "Resetting…" : "Reset password"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
