"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

type EchoClient = Echo<"reverb">;

let echoSingleton: EchoClient | null = null;

function readPublicEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export function isRealtimeConfigured(): boolean {
  return Boolean(readPublicEnv("NEXT_PUBLIC_REVERB_APP_KEY"));
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

  const key = readPublicEnv("NEXT_PUBLIC_REVERB_APP_KEY")!;
  const host = readPublicEnv("NEXT_PUBLIC_REVERB_HOST") ?? "localhost";
  const port = Number(readPublicEnv("NEXT_PUBLIC_REVERB_PORT") ?? "8080");
  const scheme = readPublicEnv("NEXT_PUBLIC_REVERB_SCHEME") ?? "http";
  const forceTLS = scheme === "https";

  // pusher-js is required by laravel-echo for the reverb broadcaster.
  (window as Window & { Pusher?: typeof Pusher }).Pusher = Pusher;

  echoSingleton = new Echo({
    broadcaster: "reverb",
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS,
    enabledTransports: ["ws", "wss"],
    authEndpoint: "/api/broker/broadcasting/auth",
  });

  return echoSingleton;
}

export function riskMetricsPrivateChannel(accountId: string): string {
  return `trading-account.${accountId}.risk-metrics`;
}
