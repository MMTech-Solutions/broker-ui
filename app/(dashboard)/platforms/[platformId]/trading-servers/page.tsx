import { SiteHeader } from "@/components/layout/site-header";
import { TradingServersView } from "@/features/trading-server/components/trading-servers-view";

type TradingServersPageProps = {
  params: Promise<{ platformId: string }>;
};

export default async function TradingServersPage({
  params,
}: TradingServersPageProps) {
  const { platformId } = await params;

  return (
    <>
      <SiteHeader
        title="Trading servers"
        description="Servers connected to a trading platform."
      />
      <TradingServersView platformId={platformId} />
    </>
  );
}
