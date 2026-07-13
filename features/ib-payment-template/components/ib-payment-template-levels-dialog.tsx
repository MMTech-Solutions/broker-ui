"use client";

import { useMemo, useState } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IbPaymentTemplateLevelDeleteDialog } from "@/features/ib-payment-template/components/ib-payment-template-level-delete-dialog";
import { IbPaymentTemplateLevelFormDialog } from "@/features/ib-payment-template/components/ib-payment-template-level-form-dialog";
import { formatPaymentTemplateRate } from "@/features/ib-payment-template/format";
import type {
  IbPaymentTemplate,
  IbPaymentTemplateLevel,
} from "@/features/ib-payment-template/types";

type IbPaymentTemplateLevelsDialogProps = {
  ibPaymentTemplate: IbPaymentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function IbPaymentTemplateLevelsDialog({
  ibPaymentTemplate,
  open,
  onOpenChange,
  onSuccess,
}: IbPaymentTemplateLevelsDialogProps) {
  const [levelFormOpen, setLevelFormOpen] = useState(false);
  const [levelDeleteOpen, setLevelDeleteOpen] = useState(false);
  const [levelFormMode, setLevelFormMode] = useState<"create" | "edit">("edit");
  const [selectedLevel, setSelectedLevel] =
    useState<IbPaymentTemplateLevel | null>(null);

  const sortedLevels = useMemo(() => {
    return [...(ibPaymentTemplate?.levels ?? [])].sort(
      (left, right) => left.sort_order - right.sort_order,
    );
  }, [ibPaymentTemplate?.levels]);

  function openCreateDialog() {
    setLevelFormMode("create");
    setSelectedLevel(null);
    setLevelFormOpen(true);
  }

  function openEditDialog(level: IbPaymentTemplateLevel) {
    setLevelFormMode("edit");
    setSelectedLevel(level);
    setLevelFormOpen(true);
  }

  function openDeleteDialog(level: IbPaymentTemplateLevel) {
    setSelectedLevel(level);
    setLevelDeleteOpen(true);
  }

  function handleLevelMutationSuccess() {
    onSuccess();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-3xl">
          <DialogHeader className="shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <DialogTitle>Payment template levels</DialogTitle>
                <DialogDescription>
                  Manage commission levels for{" "}
                  <span className="font-medium text-foreground">
                    {ibPaymentTemplate?.name}
                  </span>
                  .
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={openCreateDialog}
              >
                <PlusIcon />
                Add level
              </Button>
            </div>
          </DialogHeader>

          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto py-4">
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="w-[108px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLevels.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No levels found.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {sortedLevels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">{level.name}</TableCell>
                      <TableCell>{formatPaymentTemplateRate(level.rate)}</TableCell>
                      <TableCell>{level.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip={`Edit ${level.name}`}
                            onClick={() => openEditDialog(level)}
                          >
                            <PencilIcon />
                          </ActionTooltipButton>
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip={`Delete ${level.name}`}
                            onClick={() => openDeleteDialog(level)}
                            disabled={sortedLevels.length <= 1}
                          >
                            <Trash2Icon />
                          </ActionTooltipButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="mt-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <IbPaymentTemplateLevelFormDialog
        ibPaymentTemplate={ibPaymentTemplate}
        level={levelFormMode === "create" ? null : selectedLevel}
        open={levelFormOpen}
        onOpenChange={setLevelFormOpen}
        onSuccess={handleLevelMutationSuccess}
      />

      <IbPaymentTemplateLevelDeleteDialog
        ibPaymentTemplate={ibPaymentTemplate}
        level={selectedLevel}
        open={levelDeleteOpen}
        onOpenChange={setLevelDeleteOpen}
        onSuccess={handleLevelMutationSuccess}
      />
    </>
  );
}
