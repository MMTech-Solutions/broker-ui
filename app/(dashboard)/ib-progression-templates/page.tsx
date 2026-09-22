import { SiteHeader } from "@/components/layout/site-header";
import { IbProgressionTemplatesView } from "@/features/ib-progression-template/components/ib-progression-templates-view";

export default function IbProgressionTemplatesPage() {
  return (
    <>
      <SiteHeader title="Progression templates" description="Configure the referral-level coefficients used by IB plan progression." />
      <IbProgressionTemplatesView />
    </>
  );
}
