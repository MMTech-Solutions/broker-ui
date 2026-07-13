import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";

import { DashboardBreadcrumbs } from "@/components/layout/dashboard-breadcrumbs";
import { Button } from "@/components/ui/button";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

type PageContentToolbarProps = {
  breadcrumbs: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
};

export function PageContentToolbar({
  breadcrumbs,
  backHref,
  backLabel = "Ir atrás",
  children,
}: PageContentToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {backHref ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            render={<Link href={backHref} />}
          >
            <ArrowLeftIcon />
            {backLabel}
          </Button>
        ) : null}
        <DashboardBreadcrumbs items={breadcrumbs} />
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}
