export const APP_AREAS = {
  client: {
    id: "client",
    label: "Área de cliente",
    href: "/client",
    match: (pathname: string) =>
      pathname === "/client" || pathname.startsWith("/client/"),
  },
  admin: {
    id: "admin",
    label: "Área de administración",
    href: "/",
    match: (pathname: string) =>
      pathname !== "/login" &&
      !pathname.startsWith("/login/") &&
      pathname !== "/client" &&
      !pathname.startsWith("/client/"),
  },
  login: {
    id: "login",
    label: "Login cliente",
    href: "/login",
    match: (pathname: string) =>
      pathname === "/login" ||
      (pathname.startsWith("/login/") && !pathname.startsWith("/login/admin")),
  },
  loginAdmin: {
    id: "loginAdmin",
    label: "Login admin",
    href: "/login/admin",
    match: (pathname: string) =>
      pathname === "/login/admin" || pathname.startsWith("/login/admin/"),
  },
} as const;

export type AppAreaId = (typeof APP_AREAS)[keyof typeof APP_AREAS]["id"];

export function resolveAppArea(pathname: string): AppAreaId {
  if (APP_AREAS.loginAdmin.match(pathname)) {
    return "loginAdmin";
  }

  if (APP_AREAS.login.match(pathname)) {
    return "login";
  }

  if (APP_AREAS.client.match(pathname)) {
    return "client";
  }

  return "admin";
}
