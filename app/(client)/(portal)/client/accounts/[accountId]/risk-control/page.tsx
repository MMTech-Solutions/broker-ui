import { SiteHeader } from "@/components/layout/site-header";
import { RiskControlView } from "@/features/risk-control/components/risk-control-view";

type Props = { params: Promise<{ accountId: string }> };

export default async function ClientRiskControlPage({ params }: Props) {
  const { accountId } = await params;

  return (
    <>
      <SiteHeader title="Control de riesgo" description="Crea alertas y acciones automáticas para esta cuenta." />
      <RiskControlView accountId={accountId} surface="client" />
    </>
  );
}
