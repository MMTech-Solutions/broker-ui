import { SiteHeader } from "@/components/layout/site-header";
import { ClientTradingAccountsView } from "@/features/client-trading-account/components/client-trading-accounts-view";

export default function ClientTradingAccountsPage() {
  return (
    <>
      <SiteHeader
        title="Cuentas de trading"
        description="Gestiona tus cuentas live y demo, depósitos y retiros."
      />
      <ClientTradingAccountsView />
    </>
  );
}
