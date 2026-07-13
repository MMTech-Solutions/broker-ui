import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItem as BreadcrumbEntry } from "@/lib/navigation/breadcrumbs";

type DashboardBreadcrumbsProps = {
  items: BreadcrumbEntry[];
};

export function DashboardBreadcrumbs({ items }: DashboardBreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isCurrent = item.current ?? index === items.length - 1;
          const isLink = Boolean(item.href) && !isCurrent;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLink && item.href ? (
                  <Link
                    href={item.href}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : isCurrent ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <span className="text-muted-foreground">{item.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
