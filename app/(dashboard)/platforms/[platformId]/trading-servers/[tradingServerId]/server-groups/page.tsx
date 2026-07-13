import { SiteHeader } from "@/components/layout/site-header";
import { TradingServerGroupsView } from "@/features/trading-server/components/trading-server-groups-view";

type TradingServerGroupsPageProps = {
  params: Promise<{ platformId: string; tradingServerId: string }>;
};

export default async function TradingServerGroupsPage({
  params,
}: TradingServerGroupsPageProps) {
  const { platformId, tradingServerId } = await params;

  return (
    <>
      <SiteHeader
        title="Server groups"
        description="Server groups synchronized for a trading server."
      />
      <TradingServerGroupsView
        platformId={platformId}
        tradingServerId={tradingServerId}
      />
    </>
  );
}
