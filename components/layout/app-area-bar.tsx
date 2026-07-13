import { AreaSwitcher } from "@/components/layout/area-switcher";

export function AppAreaBar() {
  return (
    <div className="flex shrink-0 items-center justify-end border-b bg-background px-4 py-2">
      <AreaSwitcher />
    </div>
  );
}
