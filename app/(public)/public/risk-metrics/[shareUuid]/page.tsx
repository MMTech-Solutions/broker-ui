import { PublicAnalyticsOverviewView } from "@/features/client-risk-metrics/components/public-analytics-overview-view";

type PublicRiskMetricsPageProps = {
  params: Promise<{ shareUuid: string }>;
};

export default async function PublicRiskMetricsPage({
  params,
}: PublicRiskMetricsPageProps) {
  const { shareUuid } = await params;

  return <PublicAnalyticsOverviewView shareUuid={shareUuid} />;
}
