import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { TradingServerSecuritySymbolsView } from "@/features/trading-server/components/trading-server-security-symbols-view";

type TradingServerSecuritySymbolsPageProps = {
  params: Promise<{
    platformId: string;
    tradingServerId: string;
    securityId: string;
  }>;
};

export default async function TradingServerSecuritySymbolsPage({
  params,
}: TradingServerSecuritySymbolsPageProps) {
  const { platformId, tradingServerId, securityId } = await params;

  return (
    <>
      <SiteHeader
        title="Security symbols"
        description="Symbols available for a specific security."
      />
      <Suspense fallback={<Skeleton className="m-4 h-40 w-full" />}>
        <TradingServerSecuritySymbolsView
          platformId={platformId}
          tradingServerId={tradingServerId}
          securityId={securityId}
        />
      </Suspense>
    </>
  );
}
