import { SiteHeader } from "@/components/layout/site-header";
import { LeveragesView } from "@/features/leverage/components/leverages-view";

export default function LeveragesPage() {
  return (
    <>
      <SiteHeader
        title="Leverages"
        description="Leverage profiles managed by broker-service."
      />
      <LeveragesView />
    </>
  );
}
