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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createSymbolCategory,
  updateSymbolCategory,
} from "@/features/symbol-category/api";
import type { SymbolCategory } from "@/features/symbol-category/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type SymbolCategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  category: SymbolCategory | null;
  onSuccess: () => void;
};

export function SymbolCategoryFormDialog({
  open,
  onOpenChange,
  mode,
  category,
  onSuccess,
}: SymbolCategoryFormDialogProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Dialog state is initialized from the category selected by the parent view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(mode === "edit" ? (category?.name ?? "") : "");
    setError(null);
  }, [category, mode, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        await createSymbolCategory({ name: trimmedName });
      } else if (category) {
        await updateSymbolCategory(category.id, { name: trimmedName });
      }

      onOpenChange(false);
      onSuccess();
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
          <DialogTitle>
            {mode === "create" ? "Create symbol category" : "Edit symbol category"}
          </DialogTitle>
          <DialogDescription>
            Categories are global and can be shared by symbols from different trading servers.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <ApiErrorAlert title="Could not save category" message={error} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="symbol-category-name">Name</Label>
            <Input
              id="symbol-category-name"
              value={name}
              placeholder="e.g. Forex"
              maxLength={255}
              disabled={submitting}
              required
              onChange={(event) => setName(event.target.value)}
            />
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
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : mode === "create" ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
