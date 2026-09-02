"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listAllSymbolCategories } from "@/features/symbol-category/api";
import type { SymbolCategory } from "@/features/symbol-category/types";
import { updateSymbolsCategory } from "@/features/trading-server/api";
import type {
  SymbolsBulkScope,
  SymbolsCategoryUpdate,
  UpdateSymbolsCategoryInput,
} from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

const UNCATEGORIZED = "__uncategorized__";

type SetSymbolsCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradingServerId: string;
  scope: SymbolsBulkScope | null;
  initialCategoryId?: string | null;
  onSuccess: (result: SymbolsCategoryUpdate, message: string) => void;
};

function scopeDescription(scope: SymbolsBulkScope | null): string {
  if (!scope) return "Choose a category to apply.";

  switch (scope.type) {
    case "trading_server":
      return "The category will be applied to every symbol on this trading server.";
    case "server_group":
      return `The category will be applied to every symbol linked to ${scope.label}. Shared symbols will also change.`;
    case "security":
      return `The category will be applied to every symbol in ${scope.label}. Shared symbols will also change.`;
    case "symbols":
      return scope.symbolIds.length === 1
        ? `The category will be applied to ${scope.label ?? "the selected symbol"}.`
        : `The category will be applied to ${scope.symbolIds.length} selected symbols.`;
  }
}

function toRequestBody(
  scope: SymbolsBulkScope,
  categoryId: string | null,
): UpdateSymbolsCategoryInput {
  const input: UpdateSymbolsCategoryInput = { category_id: categoryId };

  switch (scope.type) {
    case "trading_server":
      return input;
    case "server_group":
      return { ...input, server_group_id: scope.serverGroupId };
    case "security":
      return { ...input, security_id: scope.securityId };
    case "symbols":
      return { ...input, symbol_ids: scope.symbolIds };
  }
}

function successMessage(result: SymbolsCategoryUpdate): string {
  const label = result.category?.name ?? "Uncategorized";
  const count = result.updated_count;

  return `Set ${label} on ${count} symbol${count === 1 ? "" : "s"}.`;
}

export function SetSymbolsCategoryDialog({
  open,
  onOpenChange,
  tradingServerId,
  scope,
  initialCategoryId,
  onSuccess,
}: SetSymbolsCategoryDialogProps) {
  const [categories, setCategories] = useState<SymbolCategory[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    // Dialog state is reset for the scope selected by the parent view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedValue(
      initialCategoryId === undefined
        ? null
        : (initialCategoryId ?? UNCATEGORIZED),
    );
    setError(null);
    setLoading(true);

    void listAllSymbolCategories()
      .then(setCategories)
      .catch((loadError) => setError(formatBrokerApiError(loadError)))
      .finally(() => setLoading(false));
  }, [initialCategoryId, open, scope]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scope || selectedValue === null) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await updateSymbolsCategory(
        tradingServerId,
        toRequestBody(
          scope,
          selectedValue === UNCATEGORIZED ? null : selectedValue,
        ),
      );
      onOpenChange(false);
      onSuccess(response.data, successMessage(response.data));
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set symbol category</DialogTitle>
          <DialogDescription>{scopeDescription(scope)}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <ApiErrorAlert title="Could not set category" message={error} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="symbol-category">Category</Label>
            <Select
              value={selectedValue}
              onValueChange={setSelectedValue}
              disabled={loading || submitting}
            >
              <SelectTrigger id="symbol-category">
                <SelectValue placeholder={loading ? "Loading categories..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNCATEGORIZED}>Uncategorized</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || submitting || !scope || selectedValue === null}
            >
              {submitting ? "Saving..." : "Apply category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
