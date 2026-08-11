import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { AppAreaBar } from "@/components/layout/app-area-bar";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import {
  readSession,
  sessionIsAuthenticated,
} from "@/lib/auth/session.server";

type ClientLoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function ClientLoginPage({
  searchParams,
}: ClientLoginPageProps) {
  const session = await readSession("client");
  if (sessionIsAuthenticated(session)) {
    const params = await searchParams;
    const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
    redirect(safeNextPath("client", rawNext));
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#0b1220] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(14,165,233,0.12),_transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div className="relative z-10 border-b border-white/10 bg-[#0b1220]/90">
        <AppAreaBar pathname="/login" />
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-8">
        <Suspense fallback={<div className="text-sm text-white/70">Cargando…</div>}>
          <LoginForm
            area="client"
            title="Área de cliente"
            description="Inicia sesión con tu cuenta IAM para operar en el portal del trader."
          />
        </Suspense>
      </div>
    </div>
  );
}
