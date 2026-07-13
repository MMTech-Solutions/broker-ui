import { SiteHeader } from "@/components/layout/site-header";
import { ContestGlobalSettingsView } from "@/features/contest/components/contest-global-settings-view";

export default function ContestSettingsPage() {
  return (
    <>
      <SiteHeader
        title="Contest settings"
        description="Global contest configuration for broker-service."
      />
      <ContestGlobalSettingsView />
    </>
  );
}
