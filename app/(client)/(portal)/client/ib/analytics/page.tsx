import { SiteHeader } from "@/components/layout/site-header";
import { IbAnalyticsView } from "@/features/ib-analytics/components/ib-analytics-view";

export default function ClientIbAnalyticsPage() {
  return <><SiteHeader title="Mis métricas IB" description="Consulta tus referidos, recompensas y evolución de ingresos." /><IbAnalyticsView audience="client" /></>;
}
