import { SiteHeader } from "@/components/layout/site-header";
import { TradingSymbolsView } from "@/features/trading-server/components/trading-symbols-view";

type TradingSymbolsPageProps = {
  params: Promise<{ platformId: string; tradingServerId: string }>;
};

export default async function TradingSymbolsPage({
  params,
}: TradingSymbolsPageProps) {
  const { platformId, tradingServerId } = await params;

  return (
    <>
      <SiteHeader
        title="Symbols"
        description="Trading symbols synchronized for a trading server."
      />
      <TradingSymbolsView
        platformId={platformId}
        tradingServerId={tradingServerId}
      />
    </>
  );
}
