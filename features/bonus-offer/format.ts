export function formatDepositPercentValue(
  value: string | number | null | undefined,
): string {
  if (value == null || value === "") {
    return "";
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  return String(parseFloat(numeric.toString()));
}

export function minorUnitsToMajorInput(
  value: string | number | null | undefined,
  precision: number,
): string {
  if (value == null || value === "") {
    return "";
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return "";
  }

  const divisor = 10 ** precision;

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
    useGrouping: false,
  }).format(numeric / divisor);
}

