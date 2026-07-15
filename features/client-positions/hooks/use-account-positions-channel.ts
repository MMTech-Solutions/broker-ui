"use client";

import { useEffect, useRef, useState } from "react";

import {
  heartbeatOpenPositionsWatch,
  unwatchOpenPositions,
  watchOpenPositions,
} from "@/features/client-positions/api";
import type { OpenPositionsSnapshotPayload } from "@/features/client-positions/types";
import {
  accountPositionsPrivateChannel,
  getEchoClient,
  isRealtimeConfigured,
  subscribeEchoConnectionStatus,
  type EchoConnectionStatus,
} from "@/lib/realtime/echo";

export type PositionsLiveStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "unavailable"
  | "error";

type UseAccountPositionsChannelOptions = {
  accountId: string;
  enabled: boolean;
  onSnapshot: (payload: OpenPositionsSnapshotPayload) => void;
};

export function useAccountPositionsChannel({
  accountId,
  enabled,
  onSnapshot,
}: UseAccountPositionsChannelOptions): PositionsLiveStatus {
  const [liveStatus, setLiveStatus] = useState<PositionsLiveStatus>("idle");
  const onSnapshotRef = useRef(onSnapshot);

  useEffect(() => {
    onSnapshotRef.current = onSnapshot;
  }, [onSnapshot]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!isRealtimeConfigured()) {
      queueMicrotask(() => setLiveStatus("unavailable"));
      return;
    }

    const echo = getEchoClient();
    if (!echo) {
      queueMicrotask(() => setLiveStatus("unavailable"));
      return;
    }

    let cancelled = false;
    let watchId: string | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    const channelName = accountPositionsPrivateChannel(accountId);

    queueMicrotask(() => {
      if (!cancelled) {
        setLiveStatus("connecting");
      }
    });

    const unsubscribeConnection = subscribeEchoConnectionStatus(
      echo,
      (status: EchoConnectionStatus) => {
        if (cancelled) return;
        if (status === "connected") {
          setLiveStatus((prev) => (prev === "error" ? prev : "connecting"));
          return;
        }
        if (status === "failed" || status === "unavailable") {
          setLiveStatus("unavailable");
          return;
        }
        if (status === "disconnected") {
          setLiveStatus("error");
        }
      },
    );

    const channel = echo.private(channelName);

    channel
      .subscribed(() => {
        if (!cancelled) {
          setLiveStatus("connected");
        }
      })
      .error(() => {
        if (!cancelled) {
          setLiveStatus("error");
        }
      });

    channel.listen(
      ".open-positions.snapshot",
      (payload: OpenPositionsSnapshotPayload) => {
        if (!cancelled) {
          onSnapshotRef.current(payload);
        }
      },
    );

    void (async () => {
      try {
        const response = await watchOpenPositions(accountId);
        if (cancelled) {
          await unwatchOpenPositions(accountId, response.data.watch_id).catch(
            () => undefined,
          );
          return;
        }

        watchId = response.data.watch_id;
        const ttl = Math.max(15, response.data.lease_ttl_seconds || 90);
        const intervalMs = Math.max(10_000, Math.floor((ttl * 1000) / 2));

        heartbeatTimer = setInterval(() => {
          if (!watchId) return;
          void heartbeatOpenPositionsWatch(accountId, watchId).catch(() => {
            if (!cancelled) {
              setLiveStatus("error");
            }
          });
        }, intervalMs);
      } catch {
        if (!cancelled) {
          setLiveStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribeConnection();
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
      echo.leave(channelName);
      if (watchId) {
        void unwatchOpenPositions(accountId, watchId).catch(() => undefined);
      }
      setLiveStatus("idle");
    };
  }, [accountId, enabled]);

  if (!enabled) {
    return "idle";
  }

  return liveStatus;
}
