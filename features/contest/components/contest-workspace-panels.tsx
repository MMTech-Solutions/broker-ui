"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Link2Icon, Undo2Icon, UnlinkIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  assignContestAward,
  assignContestCondition,
  listAssignedContestAwards,
  listAssignedContestConditions,
  listContestAwards,
  listContestBans,
  listContestConditions,
  revertContestBan,
  unassignContestAward,
  unassignContestCondition,
  updateAssignedContestAward,
  updateAssignedContestCondition,
} from "@/features/contest/api";
import { formatContestDateTime } from "@/features/contest/format";
import type { Contest, ContestAward, ContestBan, ContestCondition } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";

function PanelState({ loading, error }: { loading: boolean; error: string | null }) {
  if (error) return <ApiErrorAlert title="Could not load this section" message={error} />;
  if (loading) return <Skeleton className="h-48 w-full" />;
  return null;
}

export function ContestBansPanel({ contest }: { contest: Contest }) {
  const [bans, setBans] = useState<ContestBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listContestBans(contest.id, { per_page: 100 });
      setBans(response.data);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
    } finally {
      setLoading(false);
    }
  }, [contest.id]);

  useEffect(() => { void load(); }, [load]);

  async function revert(ban: ContestBan) {
    try {
      await revertContestBan(contest.id, ban.id);
      await load();
    } catch (actionError) {
      setError(formatBrokerApiError(actionError));
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Exclusions and bans</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <PanelState loading={loading} error={error} />
        {!loading && !error ? (
          <div className="rounded-xl border"><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Reason</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {bans.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No exclusions recorded.</TableCell></TableRow> : bans.map((ban) => (
              <TableRow key={ban.id}><TableCell>{ban.user?.name || ban.user?.id || "Unknown user"}</TableCell><TableCell>{ban.reason}</TableCell><TableCell>{formatContestDateTime(ban.banned_at)}</TableCell><TableCell><Badge variant={ban.reverted_at ? "outline" : "destructive"}>{ban.reverted_at ? "Reverted" : "Active"}</Badge></TableCell><TableCell className="text-right">{!ban.reverted_at ? <ActionTooltipButton tooltip="Revert exclusion" variant="ghost" size="icon-sm" onClick={() => void revert(ban)}><Undo2Icon /></ActionTooltipButton> : null}</TableCell></TableRow>
            ))}
          </TableBody></Table></div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ContestAwardsPanel({ contest, onChanged }: { contest: Contest; onChanged: () => void }) {
  const [assigned, setAssigned] = useState<ContestAward[]>([]);
  const [library, setLibrary] = useState<ContestAward[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [position, setPosition] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignedResponse, libraryResponse] = await Promise.all([listAssignedContestAwards(contest.id), listContestAwards({ per_page: 100 })]);
      setAssigned(assignedResponse.data);
      setLibrary(libraryResponse.data);
    } catch (loadError) { setError(formatBrokerApiError(loadError)); } finally { setLoading(false); }
  }, [contest.id]);

  useEffect(() => { void load(); }, [load]);
  const assignedIds = useMemo(() => new Set(assigned.map((item) => item.id)), [assigned]);
  const available = library.filter((item) => !assignedIds.has(item.id));

  async function assign() {
    if (!selectedId) return;
    try { await assignContestAward(contest.id, selectedId, { position }); setSelectedId(""); await load(); onChanged(); }
    catch (actionError) { setError(formatBrokerApiError(actionError)); }
  }

  async function unassign(award: ContestAward) {
    try { await unassignContestAward(contest.id, award.id); await load(); onChanged(); }
    catch (actionError) { setError(formatBrokerApiError(actionError)); }
  }

  return (
    <Card><CardHeader><CardTitle>Awards</CardTitle></CardHeader><CardContent className="space-y-4">
      <PanelState loading={loading} error={error} />
      {!loading ? <><div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_110px_auto] sm:items-end"><div className="space-y-2"><Label>Award template</Label><Select value={selectedId} onValueChange={(value) => setSelectedId(value ?? "")}><SelectTrigger className="w-full"><SelectValue placeholder="Select award" /></SelectTrigger><SelectContent>{available.map((award) => <SelectItem key={award.id} value={award.id}>{award.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Position</Label><Input type="number" min={1} value={position} onChange={(event) => setPosition(Number(event.target.value) || 1)} /></div><Button onClick={() => void assign()} disabled={!selectedId}><Link2Icon />Assign</Button></div>
      <div className="rounded-xl border"><Table><TableHeader><TableRow><TableHead>Position</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{assigned.length === 0 ? <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No awards assigned.</TableCell></TableRow> : assigned.map((award) => <TableRow key={award.id}><TableCell><Input className="w-20" type="number" min={1} defaultValue={award.position ?? 1} onBlur={(event) => void updateAssignedContestAward(contest.id, award.id, { position: Number(event.target.value) || 1 }).then(load)} /></TableCell><TableCell>{award.name}</TableCell><TableCell>{award.award_type}</TableCell><TableCell className="text-right"><ActionTooltipButton tooltip="Unassign award" variant="ghost" size="icon-sm" onClick={() => void unassign(award)}><UnlinkIcon /></ActionTooltipButton></TableCell></TableRow>)}</TableBody></Table></div>
      <Button variant="outline" render={<Link href="/contest-awards" target="_blank" />}>Open award library</Button></> : null}
    </CardContent></Card>
  );
}

export function ContestConditionsPanel({ contest }: { contest: Contest }) {
  const [assigned, setAssigned] = useState<ContestCondition[]>([]);
  const [library, setLibrary] = useState<ContestCondition[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [visible, setVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const [assignedResponse, libraryResponse] = await Promise.all([listAssignedContestConditions(contest.id), listContestConditions({ per_page: 100 })]); setAssigned(assignedResponse.data); setLibrary(libraryResponse.data); }
    catch (loadError) { setError(formatBrokerApiError(loadError)); } finally { setLoading(false); }
  }, [contest.id]);
  useEffect(() => { void load(); }, [load]);
  const assignedIds = useMemo(() => new Set(assigned.map((item) => item.id)), [assigned]);
  const available = library.filter((item) => !assignedIds.has(item.id));

  async function assign() {
    if (!selectedId) return;
    try { await assignContestCondition(contest.id, selectedId, { is_visible: visible, sort_order: sortOrder }); setSelectedId(""); await load(); }
    catch (actionError) { setError(formatBrokerApiError(actionError)); }
  }

  async function unassign(condition: ContestCondition) {
    try { await unassignContestCondition(contest.id, condition.id); await load(); }
    catch (actionError) { setError(formatBrokerApiError(actionError)); }
  }

  return (
    <Card><CardHeader><CardTitle>Conditions and rules</CardTitle></CardHeader><CardContent className="space-y-4">
      <PanelState loading={loading} error={error} />
      {!loading ? <><div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_100px_auto_auto] sm:items-end"><div className="space-y-2"><Label>Condition</Label><Select value={selectedId} onValueChange={(value) => setSelectedId(value ?? "")}><SelectTrigger className="w-full"><SelectValue placeholder="Select condition" /></SelectTrigger><SelectContent>{available.map((condition) => <SelectItem key={condition.id} value={condition.id}>{condition.title}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Order</Label><Input type="number" min={0} value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value) || 0)} /></div><label className="flex h-8 items-center gap-2"><Checkbox checked={visible} onCheckedChange={(checked) => setVisible(checked === true)} />Visible</label><Button onClick={() => void assign()} disabled={!selectedId}><Link2Icon />Assign</Button></div>
      <div className="rounded-xl border"><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Title</TableHead><TableHead>Visible</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{assigned.length === 0 ? <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No conditions assigned.</TableCell></TableRow> : assigned.map((condition) => <TableRow key={condition.id}><TableCell><Input className="w-20" type="number" min={0} defaultValue={condition.sort_order ?? 0} onBlur={(event) => void updateAssignedContestCondition(contest.id, condition.id, { sort_order: Number(event.target.value) || 0 }).then(load)} /></TableCell><TableCell>{condition.title}</TableCell><TableCell><Checkbox checked={condition.is_visible ?? true} onCheckedChange={(checked) => void updateAssignedContestCondition(contest.id, condition.id, { is_visible: checked === true }).then(load)} /></TableCell><TableCell className="text-right"><ActionTooltipButton tooltip="Unassign condition" variant="ghost" size="icon-sm" onClick={() => void unassign(condition)}><UnlinkIcon /></ActionTooltipButton></TableCell></TableRow>)}</TableBody></Table></div>
      <Button variant="outline" render={<Link href="/contest-conditions" target="_blank" />}>Open condition library</Button></> : null}
    </CardContent></Card>
  );
}
