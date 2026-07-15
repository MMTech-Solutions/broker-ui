export type PositionSide = "buy" | "sell";

export type AccountPosition = {
  id: string;
  order_id?: string;
  symbol: string;
  side: PositionSide | null;
  volume: number;
  open_price: number;
  close_price?: number | null;
  current_price: number | null;
  sl: number;
  tp: number;
  swap: number;
  profit: number;
  broker_granted_commission?: number;
  comment: string | null;
  opened_at: string | number | null;
  closed_at: string | number | null;
  snapshot_at?: string | null;
  is_live?: boolean;
};

export type LivePositionSnapshotItem = {
  position_id: string;
  symbol: string;
  side: PositionSide;
  volume: number;
  open_price: number;
  current_price: number;
  sl: number;
  tp: number;
  profit: number;
  swap: number;
  opened_at: string;
  snapshot_at: string;
};

export type OpenPositionsSnapshotPayload = {
  type: "open_positions_snapshot";
  trading_account_id?: string;
  account_id?: string | null;
  login: string;
  risk_account_id?: string | null;
  positions: LivePositionSnapshotItem[];
  positions_count: number;
  total_profit: number;
  snapshot_at: string;
};

export type ListAccountPositionsParams = {
  status: "open" | "closed";
  page?: number;
  per_page?: number;
  symbol?: string;
};

export type OpenPositionsWatchResponse = {
  watch_id: string;
  lease_ttl_seconds: number;
};

export type OpenPositionInput = {
  symbol: string;
  side: PositionSide;
  volume: number;
  sl?: number;
  tp?: number;
  comment?: string | null;
};

export type ClosePositionInput = {
  volume?: number;
  comment?: string | null;
};

/** @deprecated Prefer AccountPosition */
export type OpenPosition = AccountPosition;
