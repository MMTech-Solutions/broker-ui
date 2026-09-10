import { Suspense } from "react";

import { PositionsReportView } from "@/features/reports/positions/components/positions-report-view";

export default function PositionsReportPage() {
  return <Suspense><PositionsReportView /></Suspense>;
}
