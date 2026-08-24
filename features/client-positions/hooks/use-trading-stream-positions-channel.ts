"use client";

import { useEffect, useRef, useState } from "react";

import type {
  LivePositionSnapshotItem,
  OpenPositionsSnapshotPayload,
} from "@/features/client-positions/types";

export type TradingStreamPositionsStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "unavailable"
  | "error";

type UseTradingStreamPositionsChannelOptions = {
  accountId: string;
  enabled: boolean;
  onSnapshot: (payload: OpenPositionsSnapshotPayload) => void;
};

type GatewayWelcomeFrame = {
  type: "welcome";
  connection_id: string;
  subscribe_token: string;
};

type GatewayPosition = {
  position_id: string;
  symbol: string;
  side: "buy" | "sell";
  volume: number;
  open_price: number;
  current_price: number;
  stop_loss: number;
  take_profit: number;
  profit: number;
  swap: number;
  opened_at: string;
};

type GatewayPositionsEvent = {
  type: "account.positions.updated";
  account_id: string;
  data: {
    positions: GatewayPosition[];
    positions_count: number;
    total_profit: number;
    snapshot_at: string;
  };
};

type GatewaySubscriptionRejected = {
  type: "subscription.rejected";
  account_id: string;
  stream: "positions";
};

type SubscribeResponse = {
  allowed: boolean;
  ttl_seconds?: number;
};

const wsUrl = process.env.NEXT_PUBLIC_TRADING_STREAM_WS_URL?.trim();
const reconnectBaseDelayMs = 1_000;
const reconnectMaxDelayMs = 30_000;

export function useTradingStreamPositionsChannel({
  accountId,
  enabled,
  onSnapshot,
}: UseTradingStreamPositionsChannelOptions): TradingStreamPositionsStatus {
  const [status, setStatus] = useState<TradingStreamPositionsStatus>("idle");
  const onSnapshotRef = useRef(onSnapshot);

  useEffect(() => {
    onSnapshotRef.current = onSnapshot;
  }, [onSnapshot]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!wsUrl) {
      queueMicrotask(() => setStatus("unavailable"));
      return;
    }

    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let subscribeController: AbortController | null = null;
    let reconnectAttempt = 0;
    let terminalFailure = false;

    const clearTimers = () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (pingTimer) clearInterval(pingTimer);
      reconnectTimer = null;
      refreshTimer = null;
      pingTimer = null;
    };

    const scheduleReconnect = () => {
      if (disposed || terminalFailure || reconnectTimer) return;

      const delay = Math.min(
        reconnectBaseDelayMs * 2 ** reconnectAttempt,
        reconnectMaxDelayMs,
      );
      reconnectAttempt += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };

    const subscribe = async (welcome: GatewayWelcomeFrame) => {
      subscribeController?.abort();
      subscribeController = new AbortController();

      try {
        const response = await fetch("/api/trading-stream/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            connection_id: welcome.connection_id,
            subscribe_token: welcome.subscribe_token,
            account_id: accountId,
            stream: "positions",
          }),
          cache: "no-store",
          credentials: "same-origin",
          signal: subscribeController.signal,
        });

        const payload = (await response.json().catch(() => null)) as
          | SubscribeResponse
          | null;
        if (disposed || socket?.readyState !== WebSocket.OPEN) return;

        if (!response.ok || !payload?.allowed) {
          terminalFailure = response.status === 403;
          setStatus(terminalFailure ? "unavailable" : "error");
          socket.close();
          return;
        }

        reconnectAttempt = 0;
        setStatus("connected");
        const ttlSeconds = Math.max(15, payload.ttl_seconds ?? 30);
        refreshTimer = setTimeout(
          () => void subscribe(welcome),
          Math.floor(ttlSeconds * 800),
        );
      } catch {
        if (!disposed && !subscribeController?.signal.aborted) {
          setStatus("error");
          socket?.close();
        }
      }
    };

    const connect = () => {
      if (disposed || terminalFailure) return;

      clearTimers();
      setStatus("connecting");
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        let message: unknown;
        try {
          message = JSON.parse(String(event.data));
        } catch {
          return;
        }

        if (!isRecord(message)) return;

        if (isWelcomeFrame(message)) {
          void subscribe(message);
          return;
        }

        if (isPositionsEvent(message) && message.account_id === accountId) {
          onSnapshotRef.current(toSnapshot(message));
          return;
        }

        if (
          isSubscriptionRejected(message) &&
          message.account_id === accountId &&
          message.stream === "positions"
        ) {
          terminalFailure = true;
          setStatus("unavailable");
          socket?.close();
        }
      };

      socket.onopen = () => {
        pingTimer = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, 20_000);
      };

      socket.onerror = () => {
        if (!disposed) setStatus("error");
      };

      socket.onclose = (event) => {
        clearTimers();
        if (disposed || terminalFailure) return;

        if (event.code === 1008) {
          setStatus("unavailable");
          return;
        }

        setStatus("error");
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimers();
      subscribeController?.abort();
      socket?.close();
      setStatus("idle");
    };
  }, [accountId, enabled]);

  return enabled ? status : "idle";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWelcomeFrame(value: Record<string, unknown>): value is GatewayWelcomeFrame {
  return (
    value.type === "welcome" &&
    typeof value.connection_id === "string" &&
    typeof value.subscribe_token === "string"
  );
}

function isPositionsEvent(
  value: Record<string, unknown>,
): value is GatewayPositionsEvent {
  return (
    value.type === "account.positions.updated" &&
    typeof value.account_id === "string" &&
    isRecord(value.data) &&
    Array.isArray(value.data.positions) &&
    typeof value.data.positions_count === "number" &&
    typeof value.data.total_profit === "number" &&
    typeof value.data.snapshot_at === "string"
  );
}

function isSubscriptionRejected(
  value: Record<string, unknown>,
): value is GatewaySubscriptionRejected {
  return (
    value.type === "subscription.rejected" &&
    typeof value.account_id === "string" &&
    value.stream === "positions"
  );
}

function toSnapshot(event: GatewayPositionsEvent): OpenPositionsSnapshotPayload {
  const snapshotAt = event.data.snapshot_at;
  const positions = event.data.positions.map(
    (position): LivePositionSnapshotItem => ({
      position_id: position.position_id,
      symbol: position.symbol,
      side: position.side,
      volume: position.volume,
      open_price: position.open_price,
      current_price: position.current_price,
      sl: position.stop_loss,
      tp: position.take_profit,
      profit: position.profit,
      swap: position.swap,
      opened_at: position.opened_at,
      snapshot_at: snapshotAt,
    }),
  );

  return {
    type: "open_positions_snapshot",
    account_id: event.account_id,
    login: "",
    positions,
    positions_count: event.data.positions_count,
    total_profit: event.data.total_profit,
    snapshot_at: snapshotAt,
  };
}
