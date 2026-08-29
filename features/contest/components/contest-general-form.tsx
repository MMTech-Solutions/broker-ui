"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createContest, loadContestFormCatalog, updateContest } from "@/features/contest/api";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "@/features/contest/format";
import type { Contest, ContestFormCatalogServerGroup, CreateContestInput, EligibleIntroducingBroker, UpdateContestInput } from "@/features/contest/types";
import { minorUnitsToMajorValue, parseMajorAmountToMinorUnits } from "@/features/initial-amount/format";
import { formatBrokerApiError } from "@/lib/api/errors";

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
  force_trading_account_creation: boolean;
};

type ContestGeneralFormProps = {
  mode: "create" | "edit";
  contest?: Contest | null;
  onSaved?: (contest: Contest, warnings: string[]) => void;
};

const NONE_IB_VALUE = "__none__";
const DEFAULT_CURRENCY_PRECISION = 2;

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
  force_trading_account_creation: false,
};

function contestToForm(contest: Contest): FormState {
  const precision = contest.server_group?.currency_precision ?? DEFAULT_CURRENCY_PRECISION;

  return {
    name: contest.name,
    min_balance_threshold: minorUnitsToMajorValue(contest.min_balance_threshold, precision),
    max_balance_threshold: minorUnitsToMajorValue(contest.max_balance_threshold, precision),
    entry_fee: minorUnitsToMajorValue(contest.entry_fee, precision),
    access_code: "",
    starts_at: toDateTimeLocalValue(contest.starts_at),
    ends_at: toDateTimeLocalValue(contest.ends_at),
    linked_ib_user_id: contest.linked_ib_user_id ?? "",
    server_group_id: contest.server_group_id,
    force_trading_account_creation: contest.force_trading_account_creation,
  };
}

function amountStep(precision: number): string {
  return precision <= 0 ? "1" : `0.${"0".repeat(precision - 1)}1`;
}

export function ContestGeneralForm({
  mode,
  contest,
  onSaved,
}: ContestGeneralFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => contest ? contestToForm(contest) : emptyForm);
  const [serverGroups, setServerGroups] = useState<ContestFormCatalogServerGroup[]>([]);
  const [eligibleIbs, setEligibleIbs] = useState<EligibleIntroducingBroker[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);

    void loadContestFormCatalog()
      .then((catalog) => {
        if (!cancelled) {
          setServerGroups(catalog.serverGroups);
          setEligibleIbs(catalog.eligibleIntroducingBrokers);
        }
      })
      .catch((catalogError) => {
        if (!cancelled) setError(formatBrokerApiError(catalogError));
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const selectedServerGroup = useMemo(
    () => serverGroups.find((group) => group.id === form.server_group_id),
    [form.server_group_id, serverGroups],
  );
  const precision = selectedServerGroup?.currency_precision ?? contest?.server_group?.currency_precision ?? DEFAULT_CURRENCY_PRECISION;
  const currency = selectedServerGroup?.currency ?? contest?.server_group?.currency ?? null;
  const creationFundingWarning = mode === "create" && form.force_trading_account_creation &&
    (selectedServerGroup?.is_deposit_enabled === true || selectedServerGroup?.is_withdrawal_enabled === true);
  const editable = mode === "create" || contest?.status === "draft";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const minBalance = form.force_trading_account_creation ? 0 : parseMajorAmountToMinorUnits(form.min_balance_threshold, precision);
      const maxBalance = form.force_trading_account_creation ? 0 : parseMajorAmountToMinorUnits(form.max_balance_threshold, precision);
      const entryFee = parseMajorAmountToMinorUnits(form.entry_fee, precision);
      const startsAt = fromDateTimeLocalValue(form.starts_at);
      const endsAt = fromDateTimeLocalValue(form.ends_at);

      if (!form.name.trim() || !form.server_group_id || minBalance === undefined || maxBalance === undefined || entryFee === undefined || !startsAt || !endsAt) {
        setError("Complete all required fields with valid values.");
        return;
      }

      const payload: CreateContestInput | UpdateContestInput = {
        name: form.name.trim(),
        min_balance_threshold: minBalance,
        max_balance_threshold: maxBalance,
        entry_fee: entryFee,
        starts_at: startsAt,
        ends_at: endsAt,
        server_group_id: form.server_group_id,
        force_trading_account_creation: form.force_trading_account_creation,
        linked_ib_user_id: form.linked_ib_user_id || null,
        access_code: form.access_code.trim() || null,
      };

      const response = mode === "create"
        ? await createContest(payload as CreateContestInput)
        : await updateContest(contest!.id, payload as UpdateContestInput);
      const nextWarnings = response.meta.warnings ?? [];
      setForm(contestToForm(response.data));
      onSaved?.(response.data, nextWarnings);

      if (mode === "create") {
        router.push(`/contests/${response.data.id}?tab=general`);
      }
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  if (catalogLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create contest draft" : "General configuration"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error ? <ApiErrorAlert title="Could not save contest" message={error} /> : null}
          {!editable ? (
            <Alert><AlertTitle>Read-only configuration</AlertTitle><AlertDescription>Only draft contests can be edited.</AlertDescription></Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="contest-name">Name</Label>
            <Input id="contest-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} disabled={!editable || submitting} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contest-server-group">Server group</Label>
            <Select value={form.server_group_id} onValueChange={(value) => setForm((current) => ({ ...current, server_group_id: value ?? "" }))} disabled={!editable || submitting}>
              <SelectTrigger id="contest-server-group" className="w-full"><SelectValue placeholder="Select server group" /></SelectTrigger>
              <SelectContent>{serverGroups.map((group) => <SelectItem key={group.id} value={group.id}>{group.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.force_trading_account_creation} onChange={(event) => setForm((current) => ({ ...current, force_trading_account_creation: event.target.checked, min_balance_threshold: "0", max_balance_threshold: "0" }))} disabled={!editable || submitting} />
            Force trading account creation on registration
          </label>

          {creationFundingWarning ? (
            <Alert variant="warning"><AlertTitle>Fundable demo group</AlertTitle><AlertDescription>This server group allows deposits or withdrawals. Contest account groups should have both disabled.</AlertDescription></Alert>
          ) : null}

          {!form.force_trading_account_creation ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="contest-min-balance">Min balance{currency ? ` (${currency})` : ""}</Label><Input id="contest-min-balance" type="number" min={0} step={amountStep(precision)} value={form.min_balance_threshold} onChange={(event) => setForm((current) => ({ ...current, min_balance_threshold: event.target.value }))} disabled={!editable || submitting} required /></div>
              <div className="space-y-2"><Label htmlFor="contest-max-balance">Max balance{currency ? ` (${currency})` : ""}</Label><Input id="contest-max-balance" type="number" min={0} step={amountStep(precision)} value={form.max_balance_threshold} onChange={(event) => setForm((current) => ({ ...current, max_balance_threshold: event.target.value }))} disabled={!editable || submitting} required /></div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="contest-entry-fee">Entry fee{currency ? ` (${currency})` : ""}</Label><Input id="contest-entry-fee" type="number" min={0} step={amountStep(precision)} value={form.entry_fee} onChange={(event) => setForm((current) => ({ ...current, entry_fee: event.target.value }))} disabled={!editable || submitting} required /></div>
            <div className="space-y-2"><Label htmlFor="contest-access-code">Access code</Label><Input id="contest-access-code" value={form.access_code} onChange={(event) => setForm((current) => ({ ...current, access_code: event.target.value }))} placeholder={mode === "edit" && contest?.is_protected ? "Leave empty to keep current code" : "Optional"} disabled={!editable || submitting} /></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="contest-starts-at">Starts at</Label><Input id="contest-starts-at" type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} disabled={!editable || submitting} required /></div>
            <div className="space-y-2"><Label htmlFor="contest-ends-at">Ends at</Label><Input id="contest-ends-at" type="datetime-local" value={form.ends_at} onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))} disabled={!editable || submitting} required /></div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contest-linked-ib">Linked introducing broker</Label>
            <Select value={form.linked_ib_user_id || NONE_IB_VALUE} onValueChange={(value) => setForm((current) => ({ ...current, linked_ib_user_id: value === NONE_IB_VALUE ? "" : (value ?? "") }))} disabled={!editable || submitting}>
              <SelectTrigger id="contest-linked-ib" className="w-full"><SelectValue placeholder="No linked IB" /></SelectTrigger>
              <SelectContent><SelectItem value={NONE_IB_VALUE}>No linked IB</SelectItem>{eligibleIbs.map((ib) => <SelectItem key={ib.external_user_id} value={ib.external_user_id}>{ib.external_user_id}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {editable ? <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? "Saving..." : mode === "create" ? "Create draft" : "Save changes"}</Button></div> : null}
        </form>
      </CardContent>
    </Card>
  );
}
