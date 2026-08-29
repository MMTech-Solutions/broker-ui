"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BanIcon, PlayIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getContest } from "@/features/contest/api";
import { ContestGeneralForm } from "@/features/contest/components/contest-general-form";
import { ContestLifecycleDialog } from "@/features/contest/components/contest-lifecycle-dialog";
import { ContestSubscriptionsView } from "@/features/contest/components/contest-subscriptions-view";
import { ContestAwardsPanel, ContestBansPanel, ContestConditionsPanel } from "@/features/contest/components/contest-workspace-panels";
import { formatContestDateRange, formatContestWarning, formatMinorUnits, getContestStatusBadgeVariant } from "@/features/contest/format";
import type { Contest } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";

export type ContestWorkspaceTab = "general" | "bans" | "awards" | "conditions" | "subscriptions";

const tabs: Array<{ value: ContestWorkspaceTab; label: string }> = [
  { value: "general", label: "General" },
  { value: "bans", label: "Exclusions" },
  { value: "awards", label: "Awards" },
  { value: "conditions", label: "Conditions / Rules" },
  { value: "subscriptions", label: "Subscriptions" },
];

export function ContestWorkspaceView({ contestId, activeTab }: { contestId: string; activeTab: ContestWorkspaceTab }) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lifecycleAction, setLifecycleAction] = useState<"activate" | "cancel" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getContest(contestId);
      setContest(response.data);
      setWarnings(response.meta.warnings ?? []);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="p-4"><Skeleton className="h-[620px] w-full" /></div>;
  if (error || !contest) return <div className="p-4"><ApiErrorAlert title="Could not load contest" message={error ?? "Contest not found."} /></div>;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Contests", href: "/contests" }, { label: contest.name, current: true }]} backHref="/contests" backLabel="Back to contests" />

      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <Button key={tab.value} size="sm" variant={activeTab === tab.value ? "default" : "ghost"} render={<Link href={`/contests/${contest.id}?tab=${tab.value}`} />}>
            {tab.label}
          </Button>
        ))}
      </div>

      {warnings.length > 0 ? (
        <Alert variant="warning">
          <AlertTitle>Contest configuration warnings</AlertTitle>
          <AlertDescription><ul className="list-disc space-y-1 pl-4">{warnings.map((warning) => <li key={warning}>{formatContestWarning(warning)}</li>)}</ul></AlertDescription>
        </Alert>
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <main className="min-w-0 xl:col-span-9">
          {activeTab === "general" ? <ContestGeneralForm mode="edit" contest={contest} onSaved={(saved, nextWarnings) => { setContest(saved); setWarnings(nextWarnings); }} /> : null}
          {activeTab === "bans" ? <ContestBansPanel contest={contest} /> : null}
          {activeTab === "awards" ? <ContestAwardsPanel contest={contest} onChanged={() => void load()} /> : null}
          {activeTab === "conditions" ? <ContestConditionsPanel contest={contest} /> : null}
          {activeTab === "subscriptions" ? <ContestSubscriptionsView initialContestId={contest.id} embedded /> : null}
        </main>

        <aside className="space-y-4 xl:col-span-3">
          <Card>
            <CardHeader><CardTitle>Contest actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {contest.status === "draft" ? <Button onClick={() => setLifecycleAction("activate")}><PlayIcon />Activate</Button> : null}
              {contest.status === "draft" || contest.status === "upcoming" || contest.status === "active" ? <Button variant="destructive" onClick={() => setLifecycleAction("cancel")}><BanIcon />Cancel contest</Button> : null}
              {contest.status !== "draft" && contest.status !== "upcoming" && contest.status !== "active" ? <p className="text-sm text-muted-foreground">No lifecycle actions are available.</p> : null}
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle>Overview</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Status</span><Badge variant={getContestStatusBadgeVariant(contest.status)}>{contest.status}</Badge></div><div><p className="text-muted-foreground">Schedule</p><p>{formatContestDateRange(contest.starts_at, contest.ends_at)}</p></div><div><p className="text-muted-foreground">Entry fee</p><p>{formatMinorUnits(contest.entry_fee, contest.server_group?.currency, contest.server_group?.currency_precision)}</p></div><div><p className="text-muted-foreground">Registration</p><p>{contest.force_trading_account_creation ? "Forced account creation" : "Existing eligible account"}</p></div></CardContent></Card>

          <Card><CardHeader><CardTitle>Server group</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><p>{contest.server_group?.meta_name || contest.server_group?.name || contest.server_group_id}</p><p className="text-muted-foreground">{contest.server_group?.currency ?? "Currency unavailable"}</p></CardContent></Card>

          <Card><CardHeader><CardTitle>Introducing broker</CardTitle></CardHeader><CardContent className="text-sm"><p>{contest.linked_ib_user_id ?? "No linked IB"}</p><p className="mt-1 text-muted-foreground">Change this assignment from the General tab while the contest is in draft.</p></CardContent></Card>
        </aside>
      </div>

      <ContestLifecycleDialog contest={contest} action={lifecycleAction} open={lifecycleAction !== null} onOpenChange={(open) => { if (!open) setLifecycleAction(null); }} onSuccess={() => void load()} />
    </div>
  );
}
