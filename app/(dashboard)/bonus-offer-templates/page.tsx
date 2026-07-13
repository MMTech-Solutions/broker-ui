import { SiteHeader } from "@/components/layout/site-header";
import { BonusOfferTemplatesView } from "@/features/bonus-offer-template/components/bonus-offer-templates-view";

export default function BonusOfferTemplatesPage() {
  return (
    <>
      <SiteHeader
        title="Bonus offer templates"
        description="Reusable conversion rules and excluded instruments for bonus offers."
      />
      <BonusOfferTemplatesView />
    </>
  );
}
