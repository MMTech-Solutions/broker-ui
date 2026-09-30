import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { SiteHeader } from "@/components/layout/site-header";
import { ClientPositionsPanel } from "@/features/client-positions/components/client-positions-panel";

type AccountPositionsPageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function AccountPositionsPage({
  params,
}: AccountPositionsPageProps) {
  const { accountId } = await params;

  return (
    <>
      <SiteHeader
        title="Posiciones de la cuenta"
        description="Historial almacenado de operaciones abiertas y cerradas."
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PageContentToolbar
          breadcrumbs={[
            { label: "Inicio", href: "/client" },
            { label: "Cuentas de trading", href: "/client/accounts" },
            { label: "Posiciones", current: true },
          ]}
          backHref="/client/accounts"
          backLabel="Cuentas"
        />
        <ClientPositionsPanel accountId={accountId} />
      </div>
    </>
  );
}
