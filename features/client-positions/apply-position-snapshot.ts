import type {
  AccountPosition,
  LivePositionSnapshotItem,
  OpenPositionsSnapshotPayload,
  PositionSide,
} from "@/features/client-positions/types";

function toSide(value: unknown): PositionSide | null {
  if (value === "buy" || value === "sell") {
    return value;
  }
  return null;
}

export function normalizeLivePosition(
  item: LivePositionSnapshotItem,
): AccountPosition {
  return {
    id: item.position_id,
    order_id: item.position_id,
    symbol: item.symbol,
    side: toSide(item.side),
    volume: item.volume,
    open_price: item.open_price,
    current_price: item.current_price,
    sl: item.sl,
    tp: item.tp,
    swap: item.swap,
    profit: item.profit,
    comment: null,
    opened_at: item.opened_at,
    closed_at: null,
    snapshot_at: item.snapshot_at,
    is_live: true,
  };
}

/**
 * Full-snapshot replace: Risk WS sends the complete open book, not deltas.
 * History rows are matched by order_id === position_id when present.
 */
export function applyOpenPositionsSnapshot(
  historyRows: AccountPosition[],
  payload: OpenPositionsSnapshotPayload,
): {
  liveRows: AccountPosition[];
  displayRows: AccountPosition[];
} {
  const liveByOrderId = new Map<string, AccountPosition>();

  for (const item of payload.positions) {
    liveByOrderId.set(item.position_id, normalizeLivePosition(item));
  }

  const liveRows = Array.from(liveByOrderId.values()).sort((a, b) => {
    const aTime = toSortableTime(a.opened_at);
    const bTime = toSortableTime(b.opened_at);
    return bTime - aTime;
  });

  const historyByOrderId = new Map<string, AccountPosition>();
  for (const row of historyRows) {
    const key = row.order_id ?? row.id;
    historyByOrderId.set(key, row);
  }

  const displayRows: AccountPosition[] = [];
  const seen = new Set<string>();

  for (const live of liveRows) {
    const key = live.order_id ?? live.id;
    seen.add(key);
    const history = historyByOrderId.get(key);
    displayRows.push({
      ...history,
      ...live,
      id: history?.id ?? live.id,
      order_id: key,
      is_live: true,
    });
  }

  for (const history of historyRows) {
    const key = history.order_id ?? history.id;
    if (seen.has(key)) {
      continue;
    }
    displayRows.push({ ...history, is_live: false });
  }

  return { liveRows, displayRows };
}

function toSortableTime(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }

  if (/^\d+$/.test(value.trim())) {
    const numeric = Number(value);
    return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
