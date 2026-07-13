import { SiteHeader } from "@/components/layout/site-header";
import { ContestsView } from "@/features/contest/components/contests-view";

export default function ContestsPage() {
  return (
    <>
      <SiteHeader
        title="Contests"
        description="Trading contests managed by broker-service."
      />
      <ContestsView />
    </>
  );
}
