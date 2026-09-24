"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IbAdminAnalyticsView } from "@/features/ib-admin-analytics/components/ib-admin-analytics-view";
import { IbPartnerTierPanel } from "@/features/ib-analytics/components/ib-partner-tier-panel";

type Tab = "partner-tier" | "overview";

type IbAnalyticsViewProps = {
  audience: "admin" | "client";
  beneficiaryId?: string;
};

export function IbAnalyticsView({ audience, beneficiaryId }: IbAnalyticsViewProps) {
  const [tab, setTab] = useState<Tab>("partner-tier");

  return <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
    <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border bg-background p-1" role="tablist" aria-label="Métricas IB">
      <Button role="tab" aria-selected={tab === "partner-tier"} variant={tab === "partner-tier" ? "default" : "ghost"} size="sm" onClick={() => setTab("partner-tier")}>Partner Tier</Button>
      <Button role="tab" aria-selected={tab === "overview"} variant={tab === "overview" ? "default" : "ghost"} size="sm" onClick={() => setTab("overview")}>Overview y métricas</Button>
    </div>
    {tab === "partner-tier" ? <IbPartnerTierPanel audience={audience} beneficiaryId={beneficiaryId} /> : <IbAdminAnalyticsView audience={audience} beneficiaryId={beneficiaryId} />}
  </div>;
}
