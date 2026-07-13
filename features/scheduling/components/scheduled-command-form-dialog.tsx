"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { updateScheduledCommand } from "@/features/scheduling/api";
import {
  parametersFromAllowed,
  selectedParameters,
  toggleParameterFlag,
} from "@/features/scheduling/parameters";
import type {
  ScheduledCommand,
  ScheduledCommandParameters,
} from "@/features/scheduling/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ScheduledCommandFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduledCommand: ScheduledCommand | null;
  onSuccess: () => void;
};

type FormState = {
  description: string;
  cron_expression: string;
  is_automatic: boolean;
  parameters: ScheduledCommandParameters;
};

const emptyForm: FormState = {
  description: "",
  cron_expression: "",
  is_automatic: false,
  parameters: {},
};

export function ScheduledCommandFormDialog({
  open,
  onOpenChange,
  scheduledCommand,
  onSuccess,
}: ScheduledCommandFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !scheduledCommand) {
      return;
    }

    setError(null);
    setForm({
      description: scheduledCommand.description,
      cron_expression: scheduledCommand.cron_expression ?? "",
      is_automatic: scheduledCommand.is_automatic,
      parameters: parametersFromAllowed(
        scheduledCommand.allowed_parameters,
        scheduledCommand.parameters,
      ),
    });
  }, [open, scheduledCommand]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!scheduledCommand) {
      return;
    }

    if (form.is_automatic && !form.cron_expression.trim()) {
      setError("Cron expression is required when automatic mode is enabled.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateScheduledCommand(scheduledCommand.id, {
        description: form.description.trim(),
        cron_expression: form.cron_expression.trim() || null,
        is_automatic: form.is_automatic,
        parameters:
          scheduledCommand.allowed_parameters.length > 0
            ? selectedParameters(form.parameters)
            : undefined,
      });

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
          <DialogTitle>Edit scheduled command</DialogTitle>
          <DialogDescription>
            Update schedule settings for{" "}
            <span className="font-medium text-foreground">
              {scheduledCommand?.signature ?? "this command"}
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
                title="Could not update scheduled command"
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="scheduled-command-description">Description</Label>
              <textarea
                id="scheduled-command-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                disabled={submitting}
                required
                rows={3}
                className={cn(
                  "flex min-h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="scheduled-command-is-automatic"
                checked={form.is_automatic}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    is_automatic: checked === true,
                  }))
                }
                disabled={submitting}
              />
              <Label htmlFor="scheduled-command-is-automatic">
                Run automatically
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled-command-cron">Cron expression</Label>
              <Input
                id="scheduled-command-cron"
                value={form.cron_expression}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cron_expression: event.target.value,
                  }))
                }
                placeholder="0 2 * * *"
                disabled={submitting}
                required={form.is_automatic}
              />
              <p className="text-xs text-muted-foreground">
                Required when automatic mode is enabled.
              </p>
            </div>

            {scheduledCommand &&
            scheduledCommand.allowed_parameters.length > 0 ? (
              <div className="space-y-3">
                <Label>Default parameters</Label>
                {scheduledCommand.allowed_parameters.map((flag) => (
                  <div key={flag} className="flex items-center gap-2">
                    <Checkbox
                      id={`scheduled-command-param-${flag}`}
                      checked={form.parameters[flag] === true}
                      onCheckedChange={(checked) =>
                        setForm((current) => ({
                          ...current,
                          parameters: toggleParameterFlag(
                            current.parameters,
                            flag,
                            checked === true,
                          ),
                        }))
                      }
                      disabled={submitting}
                    />
                    <Label
                      htmlFor={`scheduled-command-param-${flag}`}
                      className="font-mono text-xs"
                    >
                      {flag}
                    </Label>
                  </div>
                ))}
              </div>
            ) : null}
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
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
