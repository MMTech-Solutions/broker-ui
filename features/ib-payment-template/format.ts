export function formatPaymentTemplateRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

export function parsePaymentTemplateRatePercent(percent: number): number {
  return percent / 100;
}

export function parsePaymentTemplateRatePercentInput(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return null;
  }

  return parsePaymentTemplateRatePercent(parsed);
}
