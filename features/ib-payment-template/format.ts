/** Display API rate (0–1) as a percentage string. */
export function formatPaymentTemplateRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Parse a payment-template rate as entered in the UI.
 * Values match the API scale: 0–1 (e.g. 0.3 = 30%).
 */
export function parsePaymentTemplateRateInput(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return null;
  }

  return parsed;
}
