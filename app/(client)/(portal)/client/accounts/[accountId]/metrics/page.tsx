import { SiteHeader } from "@/components/layout/site-header";
import { ClientRiskMetricsView } from "@/features/client-risk-metrics/components/client-risk-metrics-view";

type AccountMetricsPageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function AccountMetricsPage({
  params,
}: AccountMetricsPageProps) {
  const { accountId } = await params;

  return (
    <>
      <SiteHeader
        title="Métricas de la cuenta"
        description="Resumen de rendimiento y curva de balance en tiempo real."
      />
      <ClientRiskMetricsView accountId={accountId} />
    </>
  );
}
