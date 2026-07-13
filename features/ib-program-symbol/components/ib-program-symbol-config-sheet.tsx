"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  IB_PROGRAM_SYMBOL_COMMISSION_TYPES,
  type ProgramSymbolDraft,
} from "@/features/ib-program-symbol/types";
import type { IbPaymentTemplate } from "@/features/ib-payment-template/types";

type IbProgramSymbolConfigSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ProgramSymbolDraft | null;
  paymentTemplates: IbPaymentTemplate[];
  onSave: (draft: ProgramSymbolDraft) => void;
};

export function IbProgramSymbolConfigSheet({
  open,
  onOpenChange,
  draft,
  paymentTemplates,
  onSave,
}: IbProgramSymbolConfigSheetProps) {
  const [form, setForm] = useState<ProgramSymbolDraft | null>(draft);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setForm(draft ? { ...draft } : null);
  }, [draft, open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    if (
      !form.use_for_volume_payment &&
      !form.use_for_plan_progression &&
      !form.use_for_cpa
    ) {
      setError("Enable at least one usage flag.");
      return;
    }

    if (form.use_for_volume_payment) {
      if (!form.commission_value.trim() || !form.commission_type) {
        setError("Volume payment requires commission value and type.");
        return;
      }

      if (!form.ib_payment_template_id) {
        setError("Volume payment requires a payment template.");
        return;
      }
    }

    onSave(form);
    onOpenChange(false);
  }

  const selectedTemplate = paymentTemplates.find(
    (template) => template.id === form?.ib_payment_template_id,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{form?.symbol_name ?? "Symbol configuration"}</SheetTitle>
          <SheetDescription>
            Configure how this symbol participates in IB program rules.
          </SheetDescription>
        </SheetHeader>

        {form ? (
          <form className="flex flex-1 flex-col gap-4 px-4" onSubmit={handleSubmit}>
            {error ? <ApiErrorAlert message={error} /> : null}

            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
              <p className="font-medium">{form.symbol_name}</p>
              <p className="text-muted-foreground">{form.symbol_alpha}</p>
            </div>

            <div className="space-y-3">
              <Label>Usage flags</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.use_for_volume_payment}
                    onCheckedChange={(checked) =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              use_for_volume_payment: checked === true,
                            }
                          : current,
                      )
                    }
                  />
                  Volume payment
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.use_for_plan_progression}
                    onCheckedChange={(checked) =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              use_for_plan_progression: checked === true,
                            }
                          : current,
                      )
                    }
                  />
                  Plan progression
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.use_for_cpa}
                    onCheckedChange={(checked) =>
                      setForm((current) =>
                        current
                          ? { ...current, use_for_cpa: checked === true }
                          : current,
                      )
                    }
                  />
                  CPA
                </label>
              </div>
            </div>

            {form.use_for_volume_payment ? (
              <div className="space-y-4 rounded-lg border p-3">
                <p className="text-sm font-medium">Volume payment</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="commission-value">Commission value</Label>
                    <Input
                      id="commission-value"
                      type="number"
                      min="0"
                      step="any"
                      value={form.commission_value}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? {
                                ...current,
                                commission_value: event.target.value,
                              }
                            : current,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission-type">Commission type</Label>
                    <Select
                      value={form.commission_type}
                      onValueChange={(value) =>
                        setForm((current) =>
                          current
                            ? {
                                ...current,
                                commission_type:
                                  (value as ProgramSymbolDraft["commission_type"]) ??
                                  "",
                              }
                            : current,
                        )
                      }
                    >
                      <SelectTrigger id="commission-type" className="w-full">
                        <SelectValue placeholder="Select type">
                          {IB_PROGRAM_SYMBOL_COMMISSION_TYPES.find(
                            (option) => option.value === form.commission_type,
                          )?.label ?? null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {IB_PROGRAM_SYMBOL_COMMISSION_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-template">Payment template</Label>
                  <Select
                    value={form.ib_payment_template_id}
                    onValueChange={(value) =>
                      setForm((current) =>
                        current
                          ? {
                              ...current,
                              ib_payment_template_id: value ?? "",
                            }
                          : current,
                      )
                    }
                  >
                    <SelectTrigger id="payment-template" className="w-full">
                      <SelectValue placeholder="Select payment template">
                        {selectedTemplate?.name ?? null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}

            <SheetFooter className="px-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Apply changes</Button>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
