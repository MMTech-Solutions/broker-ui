import { SiteHeader } from "@/components/layout/site-header";
import { BonusOffersView } from "@/features/bonus-offer/components/bonus-offers-view";

export default function BonusOffersPage() {
  return (
    <>
      <SiteHeader
        title="Bonus offers"
        description="Read-only list of bonus offers configured in broker-service."
      />
      <BonusOffersView />
    </>
  );
}
