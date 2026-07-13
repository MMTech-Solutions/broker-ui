import { SiteHeader } from "@/components/layout/site-header";
import { PlatformsView } from "@/features/platform/components/platforms-view";

export default function PlatformsPage() {
  return (
    <>
      <SiteHeader
        title="Platforms"
        description="Trading platforms managed by broker-service."
      />
      <PlatformsView />
    </>
  );
}
