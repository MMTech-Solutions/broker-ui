import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardBreadcrumbs } from "@/components/layout/dashboard-breadcrumbs";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

type SiteHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
};

export function SiteHeader({
  title,
  description,
  breadcrumbs,
}: SiteHeaderProps) {
  return (
    <header className="flex h-auto min-h-14 shrink-0 items-center gap-2 border-b px-4 py-3">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="min-w-0 space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <DashboardBreadcrumbs items={breadcrumbs} />
        ) : null}
        <h1 className="truncate text-sm font-medium">{title}</h1>
        {description ? (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
