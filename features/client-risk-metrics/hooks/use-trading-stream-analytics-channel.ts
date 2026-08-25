"use client";

import { useEffect, useRef, useState } from "react";

export type AnalyticsStreamFilters = {
  from_utc?: string;
  to_utc?: string;
  symbol?: string;
  side?: "buy" | "sell";
  session?: "sydney" | "tokyo" | "london" | "ny";
};

export type AnalyticsStreamStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "unavailable"
  | "error";

type WelcomeFrame = {
  type: "welcome";
  connection_id: string;
  subscribe_token: string;
};

type SubscribeResponse = { allowed: boolean; ttl_seconds?: number };

const wsUrl = process.env.NEXT_PUBLIC_TRADING_STREAM_WS_URL?.trim();
const reconnectBaseDelayMs = 1_000;
const reconnectMaxDelayMs = 30_000;

export function useTradingStreamAnalyticsChannel({
  accountId,
  filters,
  enabled,
  onUpdate,
}: {
  accountId: string;
  filters: AnalyticsStreamFilters;
  enabled: boolean;
  onUpdate: () => void;
}): AnalyticsStreamStatus {
  const [status, setStatus] = useState<AnalyticsStreamStatus>("idle");
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

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
    let controller: AbortController | null = null;
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

    const subscribe = async (welcome: WelcomeFrame) => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/trading-stream/client-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            connection_id: welcome.connection_id,
            subscribe_token: welcome.subscribe_token,
            account_id: accountId,
            stream: "analytics",
          }),
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => null)) as SubscribeResponse | null;
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
        socket.send(JSON.stringify({
          type: "analytics.set_view",
          account_id: accountId,
          filters,
          sections: ["overview", "by_symbol", "equity_curve"],
        }));
      } catch {
        if (!disposed && !controller.signal.aborted) {
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
        const frame = message;
        if (
          frame.type === "welcome" &&
          typeof frame.connection_id === "string" &&
          typeof frame.subscribe_token === "string"
        ) {
          void subscribe(frame as WelcomeFrame);
          return;
        }
        if (
          frame.account_id === accountId &&
          (frame.type === "account.analytics.updated" ||
            frame.type === "account.analytics.dashboard" ||
            frame.type === "account.analytics.resync")
        ) {
          onUpdateRef.current();
          return;
        }
        if (
          frame.type === "subscription.rejected" &&
          frame.account_id === accountId &&
          frame.stream === "analytics"
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
      controller?.abort();
      socket?.close();
    };
  }, [accountId, enabled, filters]);

  return enabled ? status : "idle";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
