"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  formatDateTimeValue,
  listBonusNegativeBalanceCompensations,
  type BonusListSortDirection,
  type BonusNegativeBalanceCompensation,
  type BonusNegativeBalanceCompensationStatus,
} from "@/features/bonus-assignment-logs";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";

type SortBy = "created_at" | "account_id" | "bonus_offer.name" | "observed_balance" | "amount_minor" | "status";
type FilterState = {
  created_at: string;
  account_id: string;
  bonus_assignment_id: string;
  external_user_id: string;
  bonus_offer_name: string;
  observed_balance: string;
  amount_minor: string;
  currency: string;
  status: "" | BonusNegativeBalanceCompensationStatus;
};

const emptyFilters: FilterState = {
  created_at: "",
  account_id: "",
  bonus_assignment_id: "",
  external_user_id: "",
  bonus_offer_name: "",
  observed_balance: "",
  amount_minor: "",
  currency: "",
  status: "",
};

function SortHead({ label, column, sortBy, direction, onSort }: {
  label: string;
  column: SortBy;
  sortBy: SortBy;
  direction: BonusListSortDirection;
  onSort: (column: SortBy) => void;
}) {
  const active = sortBy === column;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-medium">{label}</span>
      <Button type="button" variant="ghost" size="icon-sm" className="size-6" onClick={() => onSort(column)}>
        {active ? (
          direction === "asc" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />
        ) : <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />}
      </Button>
    </div>
  );
}

export function NegativeBalanceRebalancesDataTable() {
  const [draft, setDraft] = useState<FilterState>(emptyFilters);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [direction, setDirection] = useState<BonusListSortDirection>("desc");
  const [items, setItems] = useState<BonusNegativeBalanceCompensation[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listBonusNegativeBalanceCompensations({
        ...filters,
        sort_by: sortBy,
        sort_direction: direction,
        page,
        per_page: 15,
      });
      setItems(response.data);
      setPagination(response.meta.pagination ?? null);
    } catch (loadError) {
      setItems([]);
      setPagination(null);
      setError(formatBrokerApiError(loadError));
    } finally {
      setLoading(false);
    }
  }, [direction, filters, page, sortBy]);

  useEffect(() => {
    // The list request synchronizes local table state with the active query.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function applyFilters(next: FilterState = draft) {
    setPage(1);
    setFilters(next);
  }

  function onFilterEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") applyFilters();
  }

  function toggleSort(column: SortBy) {
    setDirection(sortBy === column && direction === "asc" ? "desc" : "asc");
    setSortBy(column);
    setPage(1);
  }

  const totalPages = pagination?.last_page ?? 1;

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[145px] align-bottom"><SortHead label="Created" column="created_at" sortBy={sortBy} direction={direction} onSort={toggleSort} /><Input className="mt-1.5 h-8" placeholder="Date… (Enter)" value={draft.created_at} onChange={(event) => setDraft({ ...draft, created_at: event.target.value })} onKeyDown={onFilterEnter} /></TableHead>
              <TableHead className="min-w-[160px] align-bottom"><SortHead label="Account" column="account_id" sortBy={sortBy} direction={direction} onSort={toggleSort} /><Input className="mt-1.5 h-8 font-mono text-xs" placeholder="UUID… (Enter)" value={draft.account_id} onChange={(event) => setDraft({ ...draft, account_id: event.target.value })} onKeyDown={onFilterEnter} /></TableHead>
              <TableHead className="min-w-[160px] align-bottom"><div className="text-xs font-medium">Assignment</div><Input className="mt-1.5 h-8 w-full font-mono text-xs" placeholder="UUID… (Enter)" value={draft.bonus_assignment_id} onChange={(event) => setDraft({ ...draft, bonus_assignment_id: event.target.value })} onKeyDown={onFilterEnter} /></TableHead>
              <TableHead className="min-w-[190px] align-bottom"><div className="text-xs font-medium">User</div><Input className="mt-1.5 h-8 w-full" placeholder="User ID… (Enter)" value={draft.external_user_id} onChange={(event) => setDraft({ ...draft, external_user_id: event.target.value })} onKeyDown={onFilterEnter} /></TableHead>
              <TableHead className="min-w-[160px] align-bottom"><SortHead label="Bonus offer" column="bonus_offer.name" sortBy={sortBy} direction={direction} onSort={toggleSort} /><Input className="mt-1.5 h-8" placeholder="Name… (Enter)" value={draft.bonus_offer_name} onChange={(event) => setDraft({ ...draft, bonus_offer_name: event.target.value })} onKeyDown={onFilterEnter} /></TableHead>
              <TableHead className="min-w-[145px] align-bottom"><SortHead label="Observed balance" column="observed_balance" sortBy={sortBy} direction={direction} onSort={toggleSort} /><Input className="mt-1.5 h-8" placeholder="Amount… (Enter)" value={draft.observed_balance} onChange={(event) => setDraft({ ...draft, observed_balance: event.target.value })} onKeyDown={onFilterEnter} /></TableHead>
              <TableHead className="min-w-[145px] align-bottom"><SortHead label="Compensation" column="amount_minor" sortBy={sortBy} direction={direction} onSort={toggleSort} /><div className="mt-1.5 flex gap-1"><Input className="h-8" placeholder="Minor…" value={draft.amount_minor} onChange={(event) => setDraft({ ...draft, amount_minor: event.target.value })} onKeyDown={onFilterEnter} /><Input className="h-8 w-20" placeholder="CCY" value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value })} onKeyDown={onFilterEnter} /></div></TableHead>
              <TableHead className="min-w-[135px] align-bottom"><SortHead label="Status" column="status" sortBy={sortBy} direction={direction} onSort={toggleSort} /><Select value={draft.status || "all"} onValueChange={(value) => { const next = { ...draft, status: value === "all" ? "" as const : value as BonusNegativeBalanceCompensationStatus }; setDraft(next); applyFilters(next); }}><SelectTrigger className="mt-1.5 h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="applied">Applied</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? Array.from({ length: 5 }).map((_, row) => <TableRow key={`skeleton-${row}`}>{Array.from({ length: 8 }).map((__, cell) => <TableCell key={cell}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>) : null}
            {!loading && items.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No negative-balance rebalances found.</TableCell></TableRow> : null}
            {!loading ? items.map((item) => <TableRow key={item.id}><TableCell>{formatDateTimeValue(item.created_at)}</TableCell><TableCell className="font-mono text-xs">{item.trading_account.id}</TableCell><TableCell className="font-mono text-xs">{item.bonus_assignment_id}</TableCell><TableCell><div>{item.user.name || "—"}</div><div className="text-xs text-muted-foreground">{item.user.email || item.user.id}</div></TableCell><TableCell><div>{item.bonus_offer?.name ?? "—"}</div><div className="text-xs text-muted-foreground">{item.bonus_offer ? item.bonus_offer.is_active ? "Active" : "Inactive" : "—"}</div></TableCell><TableCell className="tabular-nums">{item.observed_balance} {item.currency}</TableCell><TableCell className="tabular-nums">{(item.amount_minor / 10 ** item.currency_precision).toFixed(item.currency_precision)} {item.currency}</TableCell><TableCell><Badge variant={item.status === "applied" ? "default" : item.status === "failed" ? "destructive" : "secondary"}>{item.status}</Badge></TableCell></TableRow>) : null}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Page {pagination?.current_page ?? page} of {totalPages}{pagination?.total != null ? ` · ${pagination.total} records` : ""}</p><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={loading || page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><Button type="button" variant="outline" size="sm" disabled={loading || page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
    </div>
  );
}
