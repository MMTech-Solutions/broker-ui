import { decimalMajorToMinorUnits } from "@/features/trading-server/format";

const DEFAULT_PRECISION = 2;

export function formatInitialAmount(
  minorUnits: number,
  precision = DEFAULT_PRECISION,
): string {
  const divisor = 10 ** precision;

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(minorUnits / divisor);
}

export function minorUnitsToMajorValue(
  minorUnits: number,
  precision = DEFAULT_PRECISION,
): string {
  const divisor = 10 ** precision;

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
    useGrouping: false,
  }).format(minorUnits / divisor);
}

export function parseMajorAmountToMinorUnits(
  value: string,
  precision = DEFAULT_PRECISION,
): number | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return undefined;
  }

  const minorStr = decimalMajorToMinorUnits(trimmed, precision);
  const parsed = Number.parseInt(minorStr, 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}
