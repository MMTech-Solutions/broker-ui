import { SiteHeader } from "@/components/layout/site-header";
import { TradingSecuritiesView } from "@/features/trading-server/components/trading-securities-view";

type TradingSecuritiesPageProps = {
  params: Promise<{ platformId: string; tradingServerId: string }>;
};

export default async function TradingSecuritiesPage({
  params,
}: TradingSecuritiesPageProps) {
  const { platformId, tradingServerId } = await params;

  return (
    <>
      <SiteHeader
        title="Securities"
        description="Securities synchronized for a trading server."
      />
      <TradingSecuritiesView
        platformId={platformId}
        tradingServerId={tradingServerId}
      />
    </>
  );
}
