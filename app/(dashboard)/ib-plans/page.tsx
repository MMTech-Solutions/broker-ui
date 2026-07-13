import { SiteHeader } from "@/components/layout/site-header";
import { IbPlansView } from "@/features/ib-plan/components/ib-plans-view";

export default function IbPlansPage() {
  return (
    <>
      <SiteHeader
        title="IB Plans"
        description="Introducing broker plans managed by broker-service."
      />
      <IbPlansView />
    </>
  );
}
