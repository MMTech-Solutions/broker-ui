import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { IbRewardLogsView } from "@/features/ib-reward-logs/components/ib-reward-logs-view";

export default function IbRewardLogsPage() {
  return (
    <>
      <SiteHeader
        title="IB Reward logs"
        description="Inspect IB trading account period snapshots and reward settlement runs."
      />
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <IbRewardLogsView />
      </Suspense>
    </>
  );
}
