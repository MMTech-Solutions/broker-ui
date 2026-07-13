export function bonusOfferTemplateExcludedInstrumentsPath(
  templateId: string,
): string {
  const params = new URLSearchParams({ templateId });

  return `/bonus-offer-templates/excluded-instruments?${params.toString()}`;
}

export function bonusOfferExcludedInstrumentsPath(offerId: string): string {
  const params = new URLSearchParams({ offerId });

  return `/bonus-offers/excluded-instruments?${params.toString()}`;
}
