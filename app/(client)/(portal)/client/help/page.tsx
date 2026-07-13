import { SiteHeader } from "@/components/layout/site-header";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { ClientContestHelpCard } from "@/features/client-contest/components/client-contest-help-card";

export default function ClientHelpPage() {
  return (
    <>
      <SiteHeader
        title="Ayuda"
        description="Información general sobre los concursos."
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PageContentToolbar
          breadcrumbs={[
            { label: "Inicio", href: "/client" },
            { label: "Ayuda", current: true },
          ]}
          backHref="/client"
        />
        <ClientContestHelpCard />
      </div>
    </>
  );
}
