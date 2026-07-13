import {
  formatInitialAmount,
  parseMajorAmountToMinorUnits,
} from "@/features/initial-amount/format";
import { TRADING_SERVER_ENVIRONMENT } from "@/features/trading-server/types";

const moneyFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAccountMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function formatEnvironmentLabel(environment?: number | null): string {
  if (environment === TRADING_SERVER_ENVIRONMENT.LIVE) {
    return "Live";
  }

  if (environment === TRADING_SERVER_ENVIRONMENT.DEMO) {
    return "Demo";
  }

  return "—";
}

export function parseServerGroupDefaultAmount(
  value?: string | null,
): number {
  if (value == null || value.trim() === "") {
    return 0;
  }

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function serverGroupNeedsInitialAmount(
  serverGroup: { default_amount?: string | null },
  environment: number,
): boolean {
  return (
    environment === TRADING_SERVER_ENVIRONMENT.DEMO &&
    parseServerGroupDefaultAmount(serverGroup.default_amount) <= 0
  );
}

export { formatInitialAmount, parseMajorAmountToMinorUnits };
