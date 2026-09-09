import { SiteHeader } from "@/components/layout/site-header";
import { RiskControlView } from "@/features/risk-control/components/risk-control-view";

type Props = { params: Promise<{ accountId: string }> };

export default async function AdminRiskControlPage({ params }: Props) {
  const { accountId } = await params;

  return (
    <>
      <SiteHeader title="Risk control" description="Read-only rules and execution audit for this trading account." />
      <RiskControlView accountId={accountId} surface="admin" />
    </>
  );
}
