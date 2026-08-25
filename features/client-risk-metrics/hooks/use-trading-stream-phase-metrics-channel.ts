"use client";

import { useEffect, useRef, useState } from "react";
import type { RiskMetricChangedPayload } from "@/features/client-risk-metrics/types";

type Status = "idle" | "connecting" | "connected" | "unavailable" | "error";
type Welcome = { type: "welcome"; connection_id: string; subscribe_token: string };
type SubscribeResponse = { allowed: boolean; ttl_seconds?: number };

const wsUrl = process.env.NEXT_PUBLIC_TRADING_STREAM_WS_URL?.trim();
const reconnectBaseDelayMs = 1_000;
const reconnectMaxDelayMs = 30_000;

export function useTradingStreamPhaseMetricsChannel({
  shareUuid,
  enabled,
  onMetrics,
}: {
  shareUuid: string;
  enabled: boolean;
  onMetrics: (payload: RiskMetricChangedPayload) => void;
}): Status {
  const [status, setStatus] = useState<Status>("idle");
  const onMetricsRef = useRef(onMetrics);

  useEffect(() => {
    onMetricsRef.current = onMetrics;
  }, [onMetrics]);

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
    let startupTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let controller: AbortController | null = null;
    let reconnectAttempt = 0;
    let terminalFailure = false;

    const clearTimers = () => {
      if (startupTimer) clearTimeout(startupTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingTimer) clearInterval(pingTimer);
      startupTimer = null;
      reconnectTimer = null;
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

    const subscribe = async (welcome: Welcome) => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/trading-stream/public-subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            connection_id: welcome.connection_id,
            subscribe_token: welcome.subscribe_token,
            account_id: shareUuid,
            stream: "phase_metrics",
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
          void subscribe(frame as Welcome);
          return;
        }
        if (frame.type === "account.phase_metrics.updated" && frame.data) {
          onMetricsRef.current(frame.data as RiskMetricChangedPayload);
          return;
        }
        if (
          frame.type === "subscription.rejected" &&
          frame.account_id === shareUuid &&
          frame.stream === "phase_metrics"
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

    startupTimer = setTimeout(() => {
      startupTimer = null;
      connect();
    }, 0);
    return () => {
      disposed = true;
      clearTimers();
      controller?.abort();
      socket?.close();
    };
  }, [enabled, shareUuid]);

  return enabled ? status : "idle";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
