import { SiteHeader } from "@/components/layout/site-header";
import { IbProgramsView } from "@/features/ib-program/components/ib-programs-view";

export default function IbProgramsPage() {
  return (
    <>
      <SiteHeader
        title="IB Programs"
        description="Introducing broker programs managed by broker-service."
      />
      <IbProgramsView />
    </>
  );
}
