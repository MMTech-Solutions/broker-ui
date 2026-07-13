import { SiteHeader } from "@/components/layout/site-header";
import { ContestAwardsView } from "@/features/contest/components/contest-awards-view";

export default function ContestAwardsPage() {
  return (
    <>
      <SiteHeader
        title="Contest awards"
        description="Reusable award templates for contests."
      />
      <ContestAwardsView />
    </>
  );
}
