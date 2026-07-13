import { SiteHeader } from "@/components/layout/site-header";
import { IbRewardsView } from "@/features/ib-reward/components/ib-rewards-view";

export default function IbRewardsPage() {
  return (
    <>
      <SiteHeader
        title="IB Rewards"
        description="Browse IB reward ledger entries across programs and payment rules."
      />
      <IbRewardsView />
    </>
  );
}
