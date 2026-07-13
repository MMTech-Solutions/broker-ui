"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_AREAS, resolveAppArea } from "@/lib/navigation/app-areas";
import { cn } from "@/lib/utils";

const areaTabs = [APP_AREAS.client, APP_AREAS.admin, APP_AREAS.login] as const;

export function AreaSwitcher() {
  const pathname = usePathname();
  const activeArea = resolveAppArea(pathname);

  return (
    <nav
      aria-label="Áreas de la aplicación"
      className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5"
    >
      {areaTabs.map((area) => {
        const isActive = activeArea === area.id;

        return (
          <Link
            key={area.id}
            href={area.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {area.label}
          </Link>
        );
      })}
    </nav>
  );
}
