import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  CLIENT_SESSION_COOKIE,
} from "@/lib/auth/session-constants";
import { parseSessionPayload } from "@/lib/auth/session-crypto";

function hasValidSession(cookieValue: string | undefined): boolean {
  const payload = parseSessionPayload(cookieValue);
  if (!payload?.user_id || !payload.access_token) {
    return false;
  }

  return payload.expires_at >= Date.now();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const isLogin =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/login/admin" ||
    pathname.startsWith("/login/admin/");

  const isApi = pathname.startsWith("/api/");
  const isStatic =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");

  if (isLogin || isApi || isStatic) {
    return response;
  }

  if (pathname === "/client" || pathname.startsWith("/client/")) {
    if (!hasValidSession(request.cookies.get(CLIENT_SESSION_COOKIE)?.value)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return response;
  }

  if (!hasValidSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login/admin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
