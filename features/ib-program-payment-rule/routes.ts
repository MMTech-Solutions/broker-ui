export function ibProgramPaymentRulesPath(programId: string): string {
  const params = new URLSearchParams({ programId });

  return `/ib-program-payment-rules?${params.toString()}`;
}
