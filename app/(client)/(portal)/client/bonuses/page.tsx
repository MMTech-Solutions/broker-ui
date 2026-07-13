import { SiteHeader } from "@/components/layout/site-header";
import { ClientBonusesView } from "@/features/client-bonus/components/client-bonuses-view";

export default function ClientBonusesPage() {
  return (
    <>
      <SiteHeader
        title="Bonos"
        description="Reclama promociones y consulta el estado de tus bonos de trading."
      />
      <ClientBonusesView />
    </>
  );
}
