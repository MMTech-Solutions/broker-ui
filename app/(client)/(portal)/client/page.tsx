import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientContestHelpCard } from "@/features/client-contest/components/client-contest-help-card";

export default function ClientHomePage() {
  return (
    <>
      <SiteHeader
        title="Área de cliente"
        description="Gestiona tus cuentas de trading y participa en concursos."
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PageContentToolbar
          breadcrumbs={[{ label: "Inicio", current: true }]}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Cuentas de trading</CardTitle>
              <CardDescription>
                Crea cuentas live o demo, consulta saldos y gestiona depósitos y
                retiros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/client/accounts" />}>
                Ver cuentas
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Finanzas</CardTitle>
              <CardDescription>
                Transfiere saldo entre cuentas, simula depósitos externos y
                consulta el historial de movimientos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/client/finance" />}>
                Ver finanzas
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>IB Dashboard</CardTitle>
              <CardDescription>
                Conoce los planes de introducing broker, solicita tu suscripción y
                sigue tu progresión en los programas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/client/ib" />}>Ver IB Dashboard</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bonos de trading</CardTitle>
              <CardDescription>
                Reclama promociones manuales y revisa el progreso de conversión
                de tus bonos activos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/client/bonuses" />}>
                Ver bonos
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Seguros de trading</CardTitle>
              <CardDescription>
                Contrata cobertura para tus cuentas elegibles y consulta el
                estado de tus seguros activos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/client/insurance" />}>
                Ver seguros
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Concursos de trading</CardTitle>
              <CardDescription>
                Explora concursos activos y próximos, revisa premios y reglas, e
                inscríbete con tu cuenta de trading.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/client/contests" />}>
                Ver concursos
              </Button>
            </CardContent>
          </Card>
          <ClientContestHelpCard compact />
        </div>
      </div>
    </>
  );
}
