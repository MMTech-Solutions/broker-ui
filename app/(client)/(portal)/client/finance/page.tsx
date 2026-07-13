import { SiteHeader } from "@/components/layout/site-header";
import { ClientFinanceView } from "@/features/client-finance/components/client-finance-view";

export default function ClientFinancePage() {
  return (
    <>
      <SiteHeader
        title="Finanzas"
        description="Transfiere saldo entre tus cuentas, simula depósitos y consulta movimientos internos y externos."
      />
      <ClientFinanceView />
    </>
  );
}
