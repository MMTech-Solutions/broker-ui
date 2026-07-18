import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { AppAreaBar } from "@/components/layout/app-area-bar";
import {
  readSession,
  sessionIsAuthenticated,
} from "@/lib/auth/session.server";

export default async function AdminLoginPage() {
  const session = await readSession("admin");
  if (sessionIsAuthenticated(session)) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#111827] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(251,191,36,0.16),_transparent_50%),radial-gradient(ellipse_at_bottom,_rgba(245,158,11,0.1),_transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:40px_40px]"
      />
      <div className="relative z-10 border-b border-white/10 bg-[#111827]/90">
        <AppAreaBar pathname="/login/admin" />
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-8">
        <Suspense fallback={<div className="text-sm text-white/70">Cargando…</div>}>
          <LoginForm
            area="admin"
            title="Área de administración"
            description="Inicia sesión con una cuenta IAM con permisos de administración del broker."
          />
        </Suspense>
      </div>
    </div>
  );
}
