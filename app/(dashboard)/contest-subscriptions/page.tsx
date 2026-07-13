import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestSubscriptionsView } from "@/features/contest/components/contest-subscriptions-view";

export default function ContestSubscriptionsPage() {
  return (
    <>
      <SiteHeader
        title="Contest subscriptions"
        description="Active participant subscriptions per contest."
      />
      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        }
      >
        <ContestSubscriptionsView />
      </Suspense>
    </>
  );
}
