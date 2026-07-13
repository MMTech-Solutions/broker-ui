import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { IbProgramSymbolsView } from "@/features/ib-program-symbol/components/ib-program-symbols-view";

export default function IbProgramSymbolsPage() {
  return (
    <>
      <SiteHeader
        title="Program symbols"
        description="Associate trading symbols with an IB program and configure their rule participation."
      />
      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        }
      >
        <IbProgramSymbolsView />
      </Suspense>
    </>
  );
}
