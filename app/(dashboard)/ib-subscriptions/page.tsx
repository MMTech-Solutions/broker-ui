import { SiteHeader } from "@/components/layout/site-header";
import { IbPlanSubscriptionsView } from "@/features/ib-plan-subscription/components/ib-plan-subscriptions-view";

export default function IbSubscriptionsPage() {
  return (
    <>
      <SiteHeader
        title="IB Subscriptions"
        description="Review pending requests, approve or reject subscriptions, and manage program placement."
      />
      <IbPlanSubscriptionsView />
    </>
  );
}
