import { SiteHeader } from "@/components/layout/site-header";
import { IbVolumeRewardTradesReportView } from "@/features/reports/ib-volume-reward-trades/components/ib-volume-reward-trades-report-view";

export default function IbVolumeRewardTradesReportPage() {
  return (
    <>
      <SiteHeader title="IB volume reward trades" description="Transactional view of closed trades that generated volume rewards." />
      <IbVolumeRewardTradesReportView />
    </>
  );
}

