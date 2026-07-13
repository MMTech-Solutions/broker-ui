import { SiteHeader } from "@/components/layout/site-header";
import { IbPlanSubscriptionsView } from "@/features/ib-plan-subscription/components/ib-plan-subscriptions-view";

type IbPlanSubscriptionsPageProps = {
  params: Promise<{ ibPlanId: string }>;
};

export default async function IbPlanSubscriptionsPage({
  params,
}: IbPlanSubscriptionsPageProps) {
  const { ibPlanId } = await params;

  return (
    <>
      <SiteHeader
        title="Plan subscriptions"
        description="Manage subscription requests and active IB placements for this plan."
      />
      <IbPlanSubscriptionsView ibPlanId={ibPlanId} />
    </>
  );
}
