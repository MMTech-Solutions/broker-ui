import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { TradingServerGroupSecuritiesView } from "@/features/trading-server/components/trading-server-group-securities-view";

type TradingServerGroupSecuritiesPageProps = {
  params: Promise<{
    platformId: string;
    tradingServerId: string;
    serverGroupId: string;
  }>;
};

export default async function TradingServerGroupSecuritiesPage({
  params,
}: TradingServerGroupSecuritiesPageProps) {
  const { platformId, tradingServerId, serverGroupId } = await params;

  return (
    <>
      <SiteHeader
        title="Server group securities"
        description="Securities available for a specific server group."
      />
      <Suspense fallback={<Skeleton className="m-4 h-40 w-full" />}>
        <TradingServerGroupSecuritiesView
          platformId={platformId}
          tradingServerId={tradingServerId}
          serverGroupId={serverGroupId}
        />
      </Suspense>
    </>
  );
}
