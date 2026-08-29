"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTimeValue, listBonusNegativeBalanceCompensations, type BonusNegativeBalanceCompensation } from "@/features/bonus-assignment-logs";

export function NegativeBalanceRebalancesTable() {
  const [items, setItems] = useState<BonusNegativeBalanceCompensation[]>([]);
  const [accountId, setAccountId] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => { void listBonusNegativeBalanceCompensations({ account_id: accountId, status, sort_by: "created_at", sort_direction: "desc" }).then((response) => setItems(response.data)); }, [accountId, status]);
  return <div className="rounded-lg border"><Table><TableHeader><TableRow><TableHead>Created</TableHead><TableHead>Account<Input className="mt-1 h-8" value={accountId} onChange={(event) => setAccountId(event.target.value)} /></TableHead><TableHead>User</TableHead><TableHead>Observed balance</TableHead><TableHead>Compensation</TableHead><TableHead>Status<Input className="mt-1 h-8" value={status} onChange={(event) => setStatus(event.target.value)} /></TableHead></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.id}><TableCell>{formatDateTimeValue(item.created_at)}</TableCell><TableCell className="font-mono text-xs">{item.trading_account.id}</TableCell><TableCell><div>{item.user.name || "—"}</div><div className="text-xs text-muted-foreground">{item.user.email || item.user.id}</div></TableCell><TableCell>{item.observed_balance} {item.currency}</TableCell><TableCell>{item.amount_minor} minor</TableCell><TableCell><Badge variant={item.status === "applied" ? "default" : item.status === "failed" ? "destructive" : "secondary"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></div>;
}
