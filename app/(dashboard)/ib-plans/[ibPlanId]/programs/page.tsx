import { SiteHeader } from "@/components/layout/site-header";
import { IbPlanProgramsSyncView } from "@/features/ib-plan/components/ib-plan-programs-sync-view";

type IbPlanProgramsPageProps = {
  params: Promise<{ ibPlanId: string }>;
};

export default async function IbPlanProgramsPage({
  params,
}: IbPlanProgramsPageProps) {
  const { ibPlanId } = await params;

  return (
    <>
      <SiteHeader
        title="Plan programs"
        description="Assign IB programs to a plan and configure progression thresholds."
      />
      <IbPlanProgramsSyncView ibPlanId={ibPlanId} />
    </>
  );
}
