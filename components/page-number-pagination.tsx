"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;

type PageNumberPaginationProps = {
  currentPage: number;
  lastPage: number;
  total?: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  perPage?: number;
  perPageOptions?: readonly number[];
  onPerPageChange?: (perPage: number) => void;
};

function buildPageItems(
  currentPage: number,
  lastPage: number,
): Array<number | "ellipsis"> {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(lastPage - 1, currentPage + 1);
  const items: Array<number | "ellipsis"> = [1];

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < lastPage - 1) {
    items.push("ellipsis");
  }

  items.push(lastPage);

  return items;
}

export function PageNumberPagination({
  currentPage,
  lastPage,
  total,
  disabled,
  onPageChange,
  perPage,
  perPageOptions = PAGE_SIZE_OPTIONS,
  onPerPageChange,
}: PageNumberPaginationProps) {
  const isDisabled = disabled === true;
  const showPages = lastPage > 1;
  const showPerPage = onPerPageChange != null && perPage != null;

  if (!showPages && !showPerPage) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {Math.max(lastPage, 1)}
          {total != null ? ` (${total} total)` : ""}
        </p>
        {showPerPage ? (
          <div className="flex items-center gap-2">
            <Label htmlFor="pagination-per-page" className="text-sm font-normal">
              Per page
            </Label>
            <Select
              value={String(perPage)}
              disabled={isDisabled}
              onValueChange={(value) => {
                const parsed = Number(value);

                if (Number.isFinite(parsed) && parsed > 0) {
                  onPerPageChange(parsed);
                }
              }}
            >
              <SelectTrigger
                id="pagination-per-page"
                size="sm"
                className="w-20"
                disabled={isDisabled}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false}>
                {perPageOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      {showPages ? (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center gap-1"
        >
          {buildPageItems(currentPage, lastPage).map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1.5 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={item === currentPage ? "default" : "outline"}
                className="min-w-7"
                disabled={isDisabled}
                aria-current={item === currentPage ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ),
          )}
        </nav>
      ) : null}
    </div>
  );
}
