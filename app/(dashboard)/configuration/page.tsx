import { SiteHeader } from "@/components/layout/site-header";
import { ConfigurationView } from "@/features/configuration/components/configuration-view";

export default function ConfigurationPage() {
  return (
    <>
      <SiteHeader
        title="Configuration"
        description="Broker domain settings stored in database with schema-driven forms."
      />
      <ConfigurationView />
    </>
  );
}
