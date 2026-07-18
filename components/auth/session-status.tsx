import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  readSession,
  sessionIsAuthenticated,
} from "@/lib/auth/session.server";
import type { AuthArea } from "@/lib/auth/types";

type SessionStatusProps = {
  pathname: string;
};

function resolveAuthArea(pathname: string): AuthArea {
  if (pathname === "/login/admin" || pathname.startsWith("/login/admin/")) {
    return "admin";
  }

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return "client";
  }

  if (pathname === "/client" || pathname.startsWith("/client/")) {
    return "client";
  }

  return "admin";
}

function loginHref(area: AuthArea): string {
  return area === "admin" ? "/login/admin" : "/login";
}

export async function SessionStatus({ pathname }: SessionStatusProps) {
  const area = resolveAuthArea(pathname);
  const session = await readSession(area);
  const authed = sessionIsAuthenticated(session);

  if (!authed) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
        <span className="hidden sm:inline">Sin sesión</span>
        <Link
          href={loginHref(area)}
          className="rounded-md border px-2.5 py-1.5 font-medium text-foreground transition-colors hover:bg-muted"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const label = session?.email ?? session?.name ?? session?.user_id;

  return (
    <div className="flex max-w-[min(100%,18rem)] items-center gap-2">
      <div className="min-w-0 text-right">
        <p className="truncate text-xs font-medium text-foreground sm:text-sm">
          {label}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {area === "admin" ? "Admin" : "Cliente"}
        </p>
      </div>
      <LogoutButton area={area} />
    </div>
  );
}
