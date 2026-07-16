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
  createIbPaymentTemplateLevel,
  updateIbPaymentTemplateLevel,
} from "@/features/ib-payment-template/api";
import { parsePaymentTemplateRateInput } from "@/features/ib-payment-template/format";
import type {
  IbPaymentTemplate,
  IbPaymentTemplateLevel,
} from "@/features/ib-payment-template/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbPaymentTemplateLevelFormDialogProps = {
  ibPaymentTemplate: IbPaymentTemplate | null;
  level: IbPaymentTemplateLevel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  rate: string;
  sort_order: number;
};

const emptyForm: FormState = {
  name: "",
  rate: "",
  sort_order: 0,
};

function getNextSortOrder(template: IbPaymentTemplate | null): number {
  const levels = template?.levels ?? [];

  if (levels.length === 0) {
    return 0;
  }

  return Math.max(...levels.map((level) => level.sort_order)) + 1;
}

export function IbPaymentTemplateLevelFormDialog({
  ibPaymentTemplate,
  level,
  open,
  onOpenChange,
  onSuccess,
}: IbPaymentTemplateLevelFormDialogProps) {
  const isCreateMode = level === null;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (level) {
      setForm({
        name: level.name,
        rate: String(level.rate),
        sort_order: level.sort_order,
      });
      return;
    }

    setForm({
      ...emptyForm,
      sort_order: getNextSortOrder(ibPaymentTemplate),
    });
  }, [open, level, ibPaymentTemplate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ibPaymentTemplate) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (!form.name.trim()) {
        setError("Level name is required.");
        return;
      }

      const rate = parsePaymentTemplateRateInput(form.rate);

      if (rate === null) {
        setError("Rate must be a number between 0 and 1 (e.g. 0.3 = 30%).");
        return;
      }

      const payload = {
        name: form.name.trim(),
        rate,
        sort_order: form.sort_order,
      };

      if (isCreateMode) {
        await createIbPaymentTemplateLevel(ibPaymentTemplate.id, payload);
      } else {
        await updateIbPaymentTemplateLevel(
          ibPaymentTemplate.id,
          level.id,
          payload,
        );
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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isCreateMode ? "Add payment level" : "Edit payment level"}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode ? "Add a commission level to " : "Update the commission rate and order for "}
            <span className="font-medium text-foreground">
              {ibPaymentTemplate?.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title={
                  isCreateMode
                    ? "Could not add payment level"
                    : "Could not update payment level"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="ib-payment-template-level-name">Name</Label>
              <Input
                id="ib-payment-template-level-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ib-payment-template-level-rate">Rate (0–1)</Label>
              <Input
                id="ib-payment-template-level-rate"
                type="number"
                min={0}
                max={1}
                step="0.01"
                value={form.rate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rate: event.target.value,
                  }))
                }
                disabled={submitting}
                required
              />
              <p className="text-sm text-muted-foreground">
                Factor entre 0 y 1. Ejemplo: 0.3 = 30%.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ib-payment-template-level-order">Sort order</Label>
              <Input
                id="ib-payment-template-level-order"
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sort_order: Number(event.target.value) || 0,
                  }))
                }
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter className="mt-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? isCreateMode
                  ? "Adding..."
                  : "Saving..."
                : isCreateMode
                  ? "Add level"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
