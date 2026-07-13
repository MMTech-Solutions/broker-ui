import { SiteHeader } from "@/components/layout/site-header";
import { ClientContestsView } from "@/features/client-contest/components/client-contests-view";

export default function ClientContestsPage() {
  return (
    <>
      <SiteHeader
        title="Concursos"
        description="Concursos disponibles para participar."
      />
      <ClientContestsView />
    </>
  );
}
