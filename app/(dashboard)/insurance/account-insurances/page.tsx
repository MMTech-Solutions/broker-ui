import { SiteHeader } from "@/components/layout/site-header";
import { AccountInsurancesAdminView } from "@/features/insurance/components/account-insurances-admin-view";

export default function AccountInsurancesPage() {
  return (
    <>
      <SiteHeader
        title="Account insurances"
        description="Administrative view of user insurance contracts, statuses, and pending claims."
      />
      <AccountInsurancesAdminView />
    </>
  );
}
