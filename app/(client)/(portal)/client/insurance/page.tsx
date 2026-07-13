import { SiteHeader } from "@/components/layout/site-header";
import { ClientInsurancesView } from "@/features/client-insurance/components/client-insurances-view";

export default function ClientInsurancePage() {
  return (
    <>
      <SiteHeader
        title="Seguros"
        description="Consulta tus seguros de trading y contrata cobertura para tus cuentas elegibles."
      />
      <ClientInsurancesView />
    </>
  );
}
