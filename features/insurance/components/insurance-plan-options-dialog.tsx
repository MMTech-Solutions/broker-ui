"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listInsurancePlanOptions } from "@/features/insurance/api";
import { InsurancePlanOptionDeleteDialog } from "@/features/insurance/components/insurance-plan-option-delete-dialog";
import { InsurancePlanOptionFormDialog } from "@/features/insurance/components/insurance-plan-option-form-dialog";
import { premiumModeLabel } from "@/features/insurance/format";
import type {
  InsurancePlan,
  InsurancePlanOption,
} from "@/features/insurance/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type InsurancePlanOptionsDialogProps = {
  insurancePlan: InsurancePlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function InsurancePlanOptionsDialog({
  insurancePlan,
  open,
  onOpenChange,
  onSuccess,
}: InsurancePlanOptionsDialogProps) {
  const [options, setOptions] = useState<InsurancePlanOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [optionFormOpen, setOptionFormOpen] = useState(false);
  const [optionDeleteOpen, setOptionDeleteOpen] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<InsurancePlanOption | null>(null);

  const loadOptions = useCallback(async () => {
    if (!insurancePlan) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await listInsurancePlanOptions(insurancePlan.id);
      setOptions(response.data);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [insurancePlan]);

  useEffect(() => {
    if (!open || !insurancePlan) {
      return;
    }

    void loadOptions();
  }, [insurancePlan, loadOptions, open]);

  function handleOptionMutationSuccess() {
    void loadOptions();
    onSuccess();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-4xl">
          <DialogHeader className="shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <DialogTitle>Plan options</DialogTitle>
                <DialogDescription>
                  Manage coverage options for{" "}
                  <span className="font-medium text-foreground">
                    {insurancePlan?.name}
                  </span>
                  .
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  setSelectedOption(null);
                  setOptionFormOpen(true);
                }}
              >
                <PlusIcon />
                Add option
              </Button>
            </div>
          </DialogHeader>

          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert title="Could not load plan options" message={error} />
            ) : null}

            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Balance range</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead className="w-[108px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={`option-skeleton-${index}`}>
                          <TableCell colSpan={7}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    : null}

                  {!loading && options.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No options configured yet.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!loading
                    ? options.map((option) => (
                        <TableRow key={option.id}>
                          <TableCell>{option.coverage_percentage}%</TableCell>
                          <TableCell>{option.premium}</TableCell>
                          <TableCell>
                            {premiumModeLabel(option.premium_mode)}
                          </TableCell>
                          <TableCell>{option.duration_days} days</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {option.minimum_balance} – {option.maximum_balance}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {option.is_free_first ? (
                                <Badge variant="outline">Free first</Badge>
                              ) : null}
                              <Badge
                                variant={
                                  option.is_active ? "default" : "secondary"
                                }
                              >
                                {option.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <ActionTooltipButton
                                variant="ghost"
                                size="icon-sm"
                                tooltip="Edit option"
                                onClick={() => {
                                  setSelectedOption(option);
                                  setOptionFormOpen(true);
                                }}
                              >
                                <PencilIcon />
                              </ActionTooltipButton>
                              <ActionTooltipButton
                                variant="ghost"
                                size="icon-sm"
                                tooltip="Delete option"
                                onClick={() => {
                                  setSelectedOption(option);
                                  setOptionDeleteOpen(true);
                                }}
                              >
                                <Trash2Icon />
                              </ActionTooltipButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InsurancePlanOptionFormDialog
        insurancePlan={insurancePlan}
        option={selectedOption}
        open={optionFormOpen}
        onOpenChange={setOptionFormOpen}
        onSuccess={handleOptionMutationSuccess}
      />

      <InsurancePlanOptionDeleteDialog
        insurancePlan={insurancePlan}
        option={selectedOption}
        open={optionDeleteOpen}
        onOpenChange={setOptionDeleteOpen}
        onSuccess={handleOptionMutationSuccess}
      />
    </>
  );
}
