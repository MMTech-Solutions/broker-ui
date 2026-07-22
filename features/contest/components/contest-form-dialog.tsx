"use client";

import { useEffect, useMemo, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createContest, loadContestFormCatalog, updateContest } from "@/features/contest/api";
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "@/features/contest/format";
import type {
  Contest,
  CreateContestInput,
  UpdateContestInput,
} from "@/features/contest/types";
import type { ContestFormCatalogServerGroup } from "@/features/contest/types";
import type { EligibleIntroducingBroker } from "@/features/contest/types";
import {
  minorUnitsToMajorValue,
  parseMajorAmountToMinorUnits,
} from "@/features/initial-amount/format";
import { formatBrokerApiError } from "@/lib/api/errors";

type ContestFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  contest?: Contest | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  min_balance_threshold: string;
  max_balance_threshold: string;
  entry_fee: string;
  access_code: string;
  starts_at: string;
  ends_at: string;
  linked_ib_user_id: string;
  server_group_id: string;
};

const emptyForm: FormState = {
  name: "",
  min_balance_threshold: "0",
  max_balance_threshold: "0",
  entry_fee: "0",
  access_code: "",
  starts_at: "",
  ends_at: "",
  linked_ib_user_id: "",
  server_group_id: "",
};

const NONE_IB_VALUE = "__none__";
const DEFAULT_CURRENCY_PRECISION = 2;

function contestToForm(contest: Contest): FormState {
  const precision =
    contest.server_group?.currency_precision ?? DEFAULT_CURRENCY_PRECISION;

  return {
    name: contest.name,
    min_balance_threshold: minorUnitsToMajorValue(
      contest.min_balance_threshold,
      precision,
    ),
    max_balance_threshold: minorUnitsToMajorValue(
      contest.max_balance_threshold,
      precision,
    ),
    entry_fee: minorUnitsToMajorValue(contest.entry_fee, precision),
    access_code: "",
    starts_at: toDateTimeLocalValue(contest.starts_at),
    ends_at: toDateTimeLocalValue(contest.ends_at),
    linked_ib_user_id: contest.linked_ib_user_id ?? "",
    server_group_id: contest.server_group_id,
  };
}

function amountStep(precision: number): string {
  if (precision <= 0) {
    return "1";
  }

  return `0.${"0".repeat(precision - 1)}1`;
}

export function ContestFormDialog({
  open,
  onOpenChange,
  mode,
  contest,
  onSuccess,
}: ContestFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [serverGroups, setServerGroups] = useState<
    ContestFormCatalogServerGroup[]
  >([]);
  const [eligibleIbs, setEligibleIbs] = useState<EligibleIntroducingBroker[]>(
    [],
  );

  const selectedServerGroup = useMemo(
    () => serverGroups.find((group) => group.id === form.server_group_id),
    [form.server_group_id, serverGroups],
  );

  const currencyPrecision =
    selectedServerGroup?.currency_precision ??
    contest?.server_group?.currency_precision ??
    DEFAULT_CURRENCY_PRECISION;

  const currencyCode =
    selectedServerGroup?.currency ?? contest?.server_group?.currency ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && contest) {
      setForm(contestToForm(contest));
    } else {
      setForm(emptyForm);
    }

    setCatalogLoading(true);

    void loadContestFormCatalog()
      .then((catalog) => {
        setServerGroups(catalog.serverGroups);
        setEligibleIbs(catalog.eligibleIntroducingBrokers);
      })
      .catch((catalogError) => {
        setError(formatBrokerApiError(catalogError));
      })
      .finally(() => {
        setCatalogLoading(false);
      });
  }, [open, mode, contest]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!form.name.trim()) {
        setError("Name is required.");
        return;
      }

      if (!form.server_group_id) {
        setError("Server group is required.");
        return;
      }

      const precision =
        selectedServerGroup?.currency_precision ??
        contest?.server_group?.currency_precision ??
        DEFAULT_CURRENCY_PRECISION;

      const minBalance = parseMajorAmountToMinorUnits(
        form.min_balance_threshold,
        precision,
      );
      const maxBalance = parseMajorAmountToMinorUnits(
        form.max_balance_threshold,
        precision,
      );
      const entryFee = parseMajorAmountToMinorUnits(form.entry_fee, precision);
      const startsAt = fromDateTimeLocalValue(form.starts_at);
      const endsAt = fromDateTimeLocalValue(form.ends_at);

      if (minBalance === undefined || maxBalance === undefined) {
        setError("Balance thresholds must be valid monetary amounts.");
        return;
      }

      if (entryFee === undefined) {
        setError("Entry fee must be a valid monetary amount.");
        return;
      }

      if (!startsAt || !endsAt) {
        setError("Start and end dates are required.");
        return;
      }

      const linkedIbUserId = form.linked_ib_user_id.trim() || null;
      const accessCode = form.access_code.trim() || null;

      if (mode === "create") {
        const payload: CreateContestInput = {
          name: form.name.trim(),
          min_balance_threshold: minBalance,
          max_balance_threshold: maxBalance,
          entry_fee: entryFee,
          starts_at: startsAt,
          ends_at: endsAt,
          server_group_id: form.server_group_id,
          linked_ib_user_id: linkedIbUserId,
          access_code: accessCode,
        };

        await createContest(payload);
      } else if (contest) {
        const payload: UpdateContestInput = {
          name: form.name.trim(),
          min_balance_threshold: minBalance,
          max_balance_threshold: maxBalance,
          entry_fee: entryFee,
          starts_at: startsAt,
          ends_at: endsAt,
          server_group_id: form.server_group_id,
          linked_ib_user_id: linkedIbUserId,
          access_code: accessCode,
        };

        await updateContest(contest.id, payload);
      }

      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  const monetaryStep = amountStep(currencyPrecision);
  const currencyHint = currencyCode ? ` (${currencyCode})` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create" ? "Create contest" : "Edit contest"}
          </DialogTitle>
          <DialogDescription>
            Enter fees and balance limits in currency units of the selected
            server group
            {currencyCode ? ` (${currencyCode})` : ""}. Leave access code empty
            for a public contest.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title={
                  mode === "create"
                    ? "Could not create contest"
                    : "Could not update contest"
                }
                message={error}
              />
            ) : null}

            {catalogLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="contest-name">Name</Label>
              <Input
                id="contest-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contest-min-balance">
                  Min balance threshold{currencyHint}
                </Label>
                <Input
                  id="contest-min-balance"
                  type="number"
                  min={0}
                  step={monetaryStep}
                  value={form.min_balance_threshold}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      min_balance_threshold: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contest-max-balance">
                  Max balance threshold{currencyHint}
                </Label>
                <Input
                  id="contest-max-balance"
                  type="number"
                  min={0}
                  step={monetaryStep}
                  value={form.max_balance_threshold}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      max_balance_threshold: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contest-entry-fee">Entry fee{currencyHint}</Label>
              <Input
                id="contest-entry-fee"
                type="number"
                min={0}
                step={monetaryStep}
                value={form.entry_fee}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    entry_fee: event.target.value,
                  }))
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contest-access-code">Access code</Label>
              <Input
                id="contest-access-code"
                value={form.access_code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    access_code: event.target.value,
                  }))
                }
                disabled={submitting}
                placeholder={
                  mode === "edit" && contest?.is_protected
                    ? "Leave empty to keep current code"
                    : "Optional"
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contest-starts-at">Starts at</Label>
                <Input
                  id="contest-starts-at"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      starts_at: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contest-ends-at">Ends at</Label>
                <Input
                  id="contest-ends-at"
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ends_at: event.target.value,
                    }))
                  }
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contest-server-group">Server group</Label>
              <Select
                value={form.server_group_id}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    server_group_id: value ?? "",
                  }))
                }
                disabled={submitting || catalogLoading}
              >
                <SelectTrigger id="contest-server-group" className="w-full">
                  <SelectValue placeholder="Select server group" />
                </SelectTrigger>
                <SelectContent>
                  {serverGroups.map((serverGroup) => (
                    <SelectItem key={serverGroup.id} value={serverGroup.id}>
                      {serverGroup.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contest-linked-ib">Linked introducing broker</Label>
              <Select
                value={form.linked_ib_user_id || NONE_IB_VALUE}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    linked_ib_user_id:
                      value === NONE_IB_VALUE ? "" : (value ?? ""),
                  }))
                }
                disabled={submitting || catalogLoading}
              >
                <SelectTrigger id="contest-linked-ib" className="w-full">
                  <SelectValue placeholder="No linked IB" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_IB_VALUE}>No linked IB</SelectItem>
                  {eligibleIbs.map((ib) => (
                    <SelectItem
                      key={ib.external_user_id}
                      value={ib.external_user_id}
                    >
                      {ib.external_user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || catalogLoading}>
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
