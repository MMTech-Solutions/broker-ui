import { SiteHeader } from "@/components/layout/site-header";
import { InsurancePlansView } from "@/features/insurance/components/insurance-plans-view";

export default function InsurancePlansPage() {
  return (
    <>
      <SiteHeader
        title="Insurance plans"
        description="Manage insurance plans, coverage options, and eligible server groups."
      />
      <InsurancePlansView />
    </>
  );
}
