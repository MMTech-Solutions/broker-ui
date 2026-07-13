import { SiteHeader } from "@/components/layout/site-header";
import { BonusAssignmentLogsView } from "@/features/bonus-assignment-logs/components/bonus-assignment-logs-view";

export default function BonusAssignmentLogsPage() {
  return (
    <>
      <SiteHeader
        title="Bonus assignment logs"
        description="Administrative view of all user bonus assignments and their current status."
      />
      <BonusAssignmentLogsView />
    </>
  );
}
