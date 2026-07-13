import { SiteHeader } from "@/components/layout/site-header";
import { ClientIbDashboardView } from "@/features/client-ib/components/client-ib-dashboard-view";

export default function ClientIbDashboardPage() {
  return (
    <>
      <SiteHeader
        title="IB Dashboard"
        description="Consulta los planes de introducing broker, solicita tu suscripción y revisa tu progresión."
      />
      <ClientIbDashboardView />
    </>
  );
}
