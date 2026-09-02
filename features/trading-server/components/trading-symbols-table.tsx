"use client";

import { PercentIcon, TagsIcon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMarkup } from "@/features/trading-server/format";
import type { TradingSymbol } from "@/features/trading-server/types";

type TradingSymbolsTableProps = {
  symbols: TradingSymbol[];
  loading: boolean;
  emptyMessage: string;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onSetMarkup: (symbol: TradingSymbol) => void;
  onSetCategory: (symbol: TradingSymbol) => void;
};

export function TradingSymbolsTable({
  symbols,
  loading,
  emptyMessage,
  selectedIds,
  onSelectedIdsChange,
  onSetMarkup,
  onSetCategory,
}: TradingSymbolsTableProps) {
  const selectedSet = new Set(selectedIds);
  const allSelected = symbols.length > 0 && selectedIds.length === symbols.length;

  function toggleAll(checked: boolean) {
    onSelectedIdsChange(checked ? symbols.map((symbol) => symbol.id) : []);
  }

  function toggleOne(symbolId: string, checked: boolean) {
    if (checked) {
      onSelectedIdsChange(
        selectedSet.has(symbolId) ? selectedIds : [...selectedIds, symbolId],
      );
      return;
    }

    onSelectedIdsChange(selectedIds.filter((id) => id !== symbolId));
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44px]">
              <Checkbox
                checked={allSelected}
                disabled={loading || symbols.length === 0}
                onCheckedChange={(checked) => toggleAll(checked === true)}
                aria-label="Select all symbols on this page"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Alpha</TableHead>
            <TableHead className="w-[120px]">Stype</TableHead>
            <TableHead className="w-[160px]">Category</TableHead>
            <TableHead className="w-[140px] text-right">Markup</TableHead>
            <TableHead className="w-[108px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : null}

          {!loading && symbols.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : null}

          {!loading
            ? symbols.map((symbol) => (
                <TableRow key={symbol.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSet.has(symbol.id)}
                      onCheckedChange={(checked) =>
                        toggleOne(symbol.id, checked === true)
                      }
                      aria-label={`Select ${symbol.alpha}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{symbol.name}</TableCell>
                  <TableCell>{symbol.alpha}</TableCell>
                  <TableCell>{symbol.stype}</TableCell>
                  <TableCell>
                    {symbol.category?.name ?? (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMarkup(symbol.markup)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ActionTooltipButton
                        variant="ghost"
                        size="icon-sm"
                        tooltip={`Set category for ${symbol.alpha}`}
                        onClick={() => onSetCategory(symbol)}
                      >
                        <TagsIcon />
                      </ActionTooltipButton>
                      <ActionTooltipButton
                        variant="ghost"
                        size="icon-sm"
                        tooltip={`Set markup for ${symbol.alpha}`}
                        onClick={() => onSetMarkup(symbol)}
                      >
                        <PercentIcon />
                      </ActionTooltipButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}
