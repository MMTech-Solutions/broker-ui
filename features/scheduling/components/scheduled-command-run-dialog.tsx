"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { runScheduledCommand } from "@/features/scheduling/api";
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

type ScheduledCommandRunDialogProps = {
  scheduledCommand: ScheduledCommand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function ScheduledCommandRunDialog({
  scheduledCommand,
  open,
  onOpenChange,
  onSuccess,
}: ScheduledCommandRunDialogProps) {
  const [parameters, setParameters] = useState<ScheduledCommandParameters>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !scheduledCommand) {
      return;
    }

    setError(null);
    setParameters(
      parametersFromAllowed(
        scheduledCommand.allowed_parameters,
        scheduledCommand.parameters,
      ),
    );
  }, [open, scheduledCommand]);

  async function handleRun() {
    if (!scheduledCommand) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const hasAllowedParameters =
        scheduledCommand.allowed_parameters.length > 0;

      await runScheduledCommand(
        scheduledCommand.id,
        hasAllowedParameters
          ? { parameters: selectedParameters(parameters) }
          : {},
      );

      onOpenChange(false);
      onSuccess();
    } catch (runError) {
      setError(formatBrokerApiError(runError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setError(null);
        }

        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Run scheduled command</AlertDialogTitle>
          <AlertDialogDescription>
            Queue a manual run for{" "}
            <span className="font-medium text-foreground">
              {scheduledCommand?.signature ?? "this command"}
            </span>
            . The job runs asynchronously and appears in the command history.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert
            title="Could not run scheduled command"
            message={error}
          />
        ) : null}

        {scheduledCommand && scheduledCommand.allowed_parameters.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Parameter overrides</p>
            <p className="text-xs text-muted-foreground">
              These apply only to this run and are not saved on the command.
            </p>
            {scheduledCommand.allowed_parameters.map((flag) => (
              <div key={flag} className="flex items-center gap-2">
                <Checkbox
                  id={`scheduled-command-run-param-${flag}`}
                  checked={parameters[flag] === true}
                  onCheckedChange={(checked) =>
                    setParameters((current) =>
                      toggleParameterFlag(current, flag, checked === true),
                    )
                  }
                  disabled={submitting}
                />
                <Label
                  htmlFor={`scheduled-command-run-param-${flag}`}
                  className="font-mono text-xs"
                >
                  {flag}
                </Label>
              </div>
            ))}
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void handleRun();
            }}
          >
            {submitting ? "Queuing..." : "Run now"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
