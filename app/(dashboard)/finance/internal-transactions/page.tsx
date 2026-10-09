import { SiteHeader } from "@/components/layout/site-header";
import { FinanceTransactionsView } from "@/features/finance/components/finance-transactions-view";

export default function FinancePage() {
  return <>
    <SiteHeader title="Internas (legado)" description="Consulta administrativa de registros financieros de broker." />
    <FinanceTransactionsView kind="internal-transactions" />
  </>;
}
