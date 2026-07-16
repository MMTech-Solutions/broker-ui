"use client";

import { useEffect, useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";

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
import { createIbPaymentTemplate } from "@/features/ib-payment-template/api";
import { parsePaymentTemplateRateInput } from "@/features/ib-payment-template/format";
import type { IbPaymentTemplateLevelDraft } from "@/features/ib-payment-template/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type IbPaymentTemplateFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function createLevelDraft(index: number): IbPaymentTemplateLevelDraft {
  return {
    key: crypto.randomUUID(),
    name: "",
    rate: "",
    sort_order: index,
  };
}

const defaultLevels: IbPaymentTemplateLevelDraft[] = [
  createLevelDraft(0),
  createLevelDraft(1),
];

export function IbPaymentTemplateFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: IbPaymentTemplateFormDialogProps) {
  const [name, setName] = useState("");
  const [levels, setLevels] = useState<IbPaymentTemplateLevelDraft[]>(defaultLevels);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setName("");
    setLevels(defaultLevels.map((_, index) => createLevelDraft(index)));
  }, [open]);

  function addLevel() {
    setLevels((current) => [...current, createLevelDraft(current.length)]);
  }

  function removeLevel(key: string) {
    setLevels((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current
        .filter((level) => level.key !== key)
        .map((level, index) => ({
          ...level,
          sort_order: index,
        }));
    });
  }

  function updateLevel(
    key: string,
    patch: Partial<Omit<IbPaymentTemplateLevelDraft, "key">>,
  ) {
    setLevels((current) =>
      current.map((level) =>
        level.key === key ? { ...level, ...patch } : level,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!name.trim()) {
        setError("Template name is required.");
        return;
      }

      const parsedLevels = levels.map((level, index) => {
        const rate = parsePaymentTemplateRateInput(level.rate);

        if (!level.name.trim()) {
          throw new Error(`Level ${index + 1} name is required.`);
        }

        if (rate === null) {
          throw new Error(
            `Level ${index + 1} rate must be a number between 0 and 1 (e.g. 0.3 = 30%).`,
          );
        }

        return {
          name: level.name.trim(),
          rate,
          sort_order: level.sort_order,
        };
      });

      await createIbPaymentTemplate({
        name: name.trim(),
        levels: parsedLevels,
      });

      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : formatBrokerApiError(submitError),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Create payment template</DialogTitle>
          <DialogDescription>
            Payment templates define commission rates per upline level for volume
            settlements.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="Could not create payment template"
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="ib-payment-template-name">Name</Label>
              <Input
                id="ib-payment-template-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Levels</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLevel}
                  disabled={submitting}
                >
                  <PlusIcon />
                  Add level
                </Button>
              </div>

              <div className="space-y-3">
                {levels.map((level, index) => (
                  <div
                    key={level.key}
                    className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_120px_88px_auto]"
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`level-name-${level.key}`}>
                        Level {index + 1} name
                      </Label>
                      <Input
                        id={`level-name-${level.key}`}
                        value={level.name}
                        onChange={(event) =>
                          updateLevel(level.key, { name: event.target.value })
                        }
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`level-rate-${level.key}`}>Rate (0–1)</Label>
                      <Input
                        id={`level-rate-${level.key}`}
                        type="number"
                        min={0}
                        max={1}
                        step="0.01"
                        value={level.rate}
                        onChange={(event) =>
                          updateLevel(level.key, {
                            rate: event.target.value,
                          })
                        }
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`level-order-${level.key}`}>Order</Label>
                      <Input
                        id={`level-order-${level.key}`}
                        type="number"
                        min={0}
                        value={level.sort_order}
                        onChange={(event) =>
                          updateLevel(level.key, {
                            sort_order: Number(event.target.value) || 0,
                          })
                        }
                        disabled={submitting}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeLevel(level.key)}
                        disabled={submitting || levels.length <= 1}
                        aria-label={`Remove level ${index + 1}`}
                      >
                        <MinusIcon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
