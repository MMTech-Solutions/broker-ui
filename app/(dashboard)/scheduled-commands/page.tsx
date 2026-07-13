import { SiteHeader } from "@/components/layout/site-header";
import { ScheduledCommandsView } from "@/features/scheduling/components/scheduled-commands-view";

export default function ScheduledCommandsPage() {
  return (
    <>
      <SiteHeader
        title="Scheduling"
        description="Manage scheduled broker commands and manual runs."
      />
      <ScheduledCommandsView />
    </>
  );
}
