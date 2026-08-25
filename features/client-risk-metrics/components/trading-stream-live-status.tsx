import { WifiIcon, WifiOffIcon } from "lucide-react";

type TradingStreamStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "unavailable"
  | "error";

export function TradingStreamLiveStatus({
  status,
}: {
  status: TradingStreamStatus;
}) {
  if (status === "connected") {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
        <WifiIcon className="size-3" />
        Live
      </span>
    );
  }

  if (status === "connecting" || status === "idle") {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700">
        <WifiIcon className="size-3 animate-pulse" />
        Connecting…
      </span>
    );
  }

  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-muted px-3 text-xs font-semibold text-muted-foreground">
      <WifiOffIcon className="size-3" />
      Live unavailable
    </span>
  );
}
