import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { IbProgramPaymentRulesView } from "@/features/ib-program-payment-rule/components/ib-program-payment-rules-view";

export default function IbProgramPaymentRulesPage() {
  return (
    <>
      <SiteHeader
        title="Program payment rules"
        description="Configure Volume, PnL, and CPA payment rules admitted by each IB program."
      />
      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        }
      >
        <IbProgramPaymentRulesView />
      </Suspense>
    </>
  );
}
