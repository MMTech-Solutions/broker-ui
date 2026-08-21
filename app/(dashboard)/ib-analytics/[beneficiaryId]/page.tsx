import { SiteHeader } from "@/components/layout/site-header";
import { IbAnalyticsView } from "@/features/ib-analytics/components/ib-analytics-view";

export default async function IbAnalyticsPage({ params }: { params: Promise<{ beneficiaryId: string }> }) {
  const { beneficiaryId } = await params;

  return <><SiteHeader title="Métricas IB" description="Revisa referidos, recompensas y analíticas del IB seleccionado." /><IbAnalyticsView audience="admin" beneficiaryId={beneficiaryId} /></>;
}
