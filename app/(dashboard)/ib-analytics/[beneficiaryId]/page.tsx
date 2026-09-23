import { SiteHeader } from "@/components/layout/site-header";
import { IbAdminAnalyticsView } from "@/features/ib-admin-analytics/components/ib-admin-analytics-view";

export default async function IbAnalyticsPage({
  params,
}: {
  params: Promise<{ beneficiaryId: string }>;
}) {
  const { beneficiaryId } = await params;

  return (
    <>
      <SiteHeader
        title="IB Analytics"
        description="Overview administrativo del IB seleccionado."
      />
      <IbAdminAnalyticsView beneficiaryId={beneficiaryId} />
    </>
  );
}
