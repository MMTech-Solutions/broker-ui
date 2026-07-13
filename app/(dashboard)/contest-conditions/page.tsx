import { SiteHeader } from "@/components/layout/site-header";
import { ContestConditionsView } from "@/features/contest/components/contest-conditions-view";

export default function ContestConditionsPage() {
  return (
    <>
      <SiteHeader
        title="Contest conditions"
        description="Reusable condition templates for contests."
      />
      <ContestConditionsView />
    </>
  );
}
