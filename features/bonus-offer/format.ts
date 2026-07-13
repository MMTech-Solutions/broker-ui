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
