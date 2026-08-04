import { PublicRiskMetricsView } from "@/features/client-risk-metrics/components/public-risk-metrics-view";

type PublicRiskMetricsPageProps = {
  params: Promise<{ shareUuid: string }>;
};

export default async function PublicRiskMetricsPage({
  params,
}: PublicRiskMetricsPageProps) {
  const { shareUuid } = await params;

  return <PublicRiskMetricsView shareUuid={shareUuid} />;
}
