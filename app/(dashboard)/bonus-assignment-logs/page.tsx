import { SiteHeader } from "@/components/layout/site-header";
import { BonusAssignmentLogsView } from "@/features/bonus-assignment-logs/components/bonus-assignment-logs-view";

export default function BonusAssignmentLogsPage() {
  return (
    <>
      <SiteHeader
        title="Bonus logs"
        description="Assignments and deposit intents: runtime status for bonus grants and deferred once-per-account deposit evaluations."
      />
      <BonusAssignmentLogsView />
    </>
  );
}
