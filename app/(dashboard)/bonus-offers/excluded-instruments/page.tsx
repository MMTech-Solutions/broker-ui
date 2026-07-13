import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { BonusExcludedInstrumentsView } from "@/features/bonus-excluded-instrument/components/bonus-excluded-instruments-view";

export default function BonusOfferExcludedInstrumentsPage() {
  return (
    <>
      <SiteHeader
        title="Offer excluded instruments"
        description="Browse trading symbols by server group and exclude them from bonus conversion activity."
      />
      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        }
      >
        <BonusExcludedInstrumentsView mode="offer" />
      </Suspense>
    </>
  );
}
