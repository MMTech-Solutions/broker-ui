"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

type EchoClient = Echo<"reverb">;

const AUTH_ENDPOINT = "/api/broker/broadcasting/auth";

let echoSingleton: EchoClient | null = null;

/**
 * Gateway/REVERB_SERVER_PATH prefix (e.g. /api/broker/v1/broadcasting).
 * Pusher builds wss://host{wsPath}/app/{key}. Empty = default /app/{key} (local Reverb).
 */
function normalizeReverbWsPath(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }

  const path = raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");

  if (!path || path === "/") {
    return undefined;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Pusher hardcodes the `/app/{key}` segment. Allow overriding to e.g. `apps`
 * via env for gateway experiments (prop-firm uses the standard `app`).
 */
function normalizeAppSegment(raw: string | undefined): "app" | "apps" {
  const segment = raw?.trim().replace(/^["']|["']$/g, "").toLowerCase();
  return segment === "apps" ? "apps" : "app";
}

/**
 * Rewrite WebSocket handshake URLs so `/app/` becomes `/{segment}/` when needed.
 * Scoped once per page; only touches pusher-style `/app/{key}` paths.
 */
function installWebSocketAppSegmentRewrite(segment: "app" | "apps"): void {
  if (segment === "app" || typeof window === "undefined") {
    return;
  }

  const marker = "__mmtReverbAppSegmentRewrite";
  const w = window as Window & { [marker]?: string };
  if (w[marker] === segment) {
    return;
  }

  const NativeWebSocket = window.WebSocket;

  function RewritingWebSocket(
    this: WebSocket,
    url: string | URL,
    protocols?: string | string[],
  ): WebSocket {
    const original = typeof url === "string" ? url : url.toString();
    const rewritten = original.replace(/\/app\//, `/${segment}/`);
    return protocols === undefined
      ? new NativeWebSocket(rewritten)
      : new NativeWebSocket(rewritten, protocols);
  }

  RewritingWebSocket.prototype = NativeWebSocket.prototype;
  Object.assign(RewritingWebSocket, NativeWebSocket);
  // @ts-expect-error assign constructable WebSocket wrapper
  window.WebSocket = RewritingWebSocket;
  w[marker] = segment;
}

const reverbConfig = {
  appKey: process.env.NEXT_PUBLIC_REVERB_APP_KEY?.trim(),
  host: process.env.NEXT_PUBLIC_REVERB_HOST?.trim() || "localhost",
  port: Number(process.env.NEXT_PUBLIC_REVERB_PORT?.trim() || "8080"),
  scheme: process.env.NEXT_PUBLIC_REVERB_SCHEME?.trim() || "http",
  wsPath: normalizeReverbWsPath(process.env.NEXT_PUBLIC_REVERB_PATH),
  appSegment: normalizeAppSegment(process.env.NEXT_PUBLIC_REVERB_APP_SEGMENT),
} as const;

export function isRealtimeConfigured(): boolean {
  return Boolean(reverbConfig.appKey);
}

/**
 * Resolve the Pusher constructor across CJS/ESM interop shapes used by bundlers.
 */
function resolvePusherConstructor(): typeof Pusher {
  const candidate = Pusher as unknown as {
    default?: unknown;
    Pusher?: unknown;
  };

  if (typeof Pusher === "function") {
    return Pusher;
  }

  if (typeof candidate.default === "function") {
    return candidate.default as typeof Pusher;
  }

  if (typeof candidate.Pusher === "function") {
    return candidate.Pusher as typeof Pusher;
  }

  throw new Error("pusher-js constructor is not available");
}

export function getEchoClient(): EchoClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!isRealtimeConfigured()) {
    return null;
  }

  if (echoSingleton) {
    return echoSingleton;
  }

  const key = reverbConfig.appKey!;
  const { host, port, scheme, wsPath, appSegment } = reverbConfig;
  const forceTLS = scheme === "https";
  const PusherClient = resolvePusherConstructor();

  installWebSocketAppSegmentRewrite(appSegment);

  // Prefer explicit constructor injection over window.Pusher (more reliable in Next).
  echoSingleton = new Echo({
    broadcaster: "reverb",
    key,
    Pusher: PusherClient,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS,
    ...(wsPath ? { wsPath } : {}),
    enabledTransports: ["ws", "wss"],
    disableStats: true,
    authEndpoint: AUTH_ENDPOINT,
    auth: {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    },
    channelAuthorization: {
      endpoint: AUTH_ENDPOINT,
      transport: "ajax",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    },
  });

  return echoSingleton;
}

export function riskMetricsPrivateChannel(accountId: string): string {
  return `trading-account.${accountId}.risk-metrics`;
}

export function accountPositionsPrivateChannel(accountId: string): string {
  return `trading-account.${accountId}.positions`;
}

export type EchoConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "unavailable";

export function subscribeEchoConnectionStatus(
  echo: EchoClient,
  onChange: (status: EchoConnectionStatus) => void,
): () => void {
  const connector = (
    echo as unknown as {
      connector?: {
        pusher?: {
          connection: {
            state: string;
            bind: (event: string, callback: (...args: unknown[]) => void) => void;
            unbind: (event: string, callback: (...args: unknown[]) => void) => void;
          };
        };
      };
    }
  ).connector;

  const connection = connector?.pusher?.connection;
  if (!connection) {
    onChange("failed");
    return () => undefined;
  }

  const emit = () => {
    const state = connection.state;
    if (
      state === "connecting" ||
      state === "connected" ||
      state === "disconnected" ||
      state === "failed" ||
      state === "unavailable"
    ) {
      onChange(state);
      return;
    }

    onChange("disconnected");
  };

  emit();
  connection.bind("state_change", emit);

  return () => {
    connection.unbind("state_change", emit);
  };
}
