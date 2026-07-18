import { headers } from "next/headers";

import { SessionStatus } from "@/components/auth/session-status";
import { AreaSwitcher } from "@/components/layout/area-switcher";

type AppAreaBarProps = {
  pathname?: string;
};

export async function AppAreaBar(props: AppAreaBarProps = {}) {
  const h = await headers();
  const resolvedPath = props.pathname ?? h.get("x-pathname") ?? "/";

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-2">
      <AreaSwitcher />
      <SessionStatus pathname={resolvedPath} />
    </div>
  );
}
