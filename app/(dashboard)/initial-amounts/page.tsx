import { SiteHeader } from "@/components/layout/site-header";
import { InitialAmountsView } from "@/features/initial-amount/components/initial-amounts-view";

export default function InitialAmountsPage() {
  return (
    <>
      <SiteHeader
        title="Default amounts"
        description="Demo account default amounts managed by broker-service."
      />
      <InitialAmountsView />
    </>
  );
}
