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
import { updateSymbolsMarkup } from "@/features/trading-server/api";
import { formatMarkup } from "@/features/trading-server/format";
import type {
  SymbolsMarkupScope,
  SymbolsMarkupUpdate,
} from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type SetSymbolsMarkupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradingServerId: string;
  scope: SymbolsMarkupScope | null;
  initialMarkup?: string | null;
  onSuccess: (result: SymbolsMarkupUpdate, message: string) => void;
};

function scopeDescription(scope: SymbolsMarkupScope | null): string {
  if (!scope) {
    return "Choose a markup value to apply.";
  }

  switch (scope.type) {
    case "trading_server":
      return "This value will be applied to every symbol on this trading server.";
    case "server_group":
      return `This value will be applied to every symbol linked to ${scope.label}. Symbols shared with other groups will also change.`;
    case "security":
      return `This value will be applied to every symbol in ${scope.label}. Symbols shared with other securities will also change.`;
    case "symbols":
      return scope.symbolIds.length === 1
        ? `This value will be applied to ${scope.label ?? "the selected symbol"}.`
        : `This value will be applied to ${scope.symbolIds.length} selected symbols.`;
  }
}

function successMessage(
  scope: SymbolsMarkupScope,
  result: SymbolsMarkupUpdate,
): string {
  const markup = formatMarkup(result.markup);
  const count = result.updated_count;

  switch (scope.type) {
    case "trading_server":
      return `Updated markup to ${markup} on ${count} symbol${count === 1 ? "" : "s"} of this trading server.`;
    case "server_group":
      return `Updated markup to ${markup} on ${count} symbol${count === 1 ? "" : "s"} in ${scope.label}.`;
    case "security":
      return `Updated markup to ${markup} on ${count} symbol${count === 1 ? "" : "s"} in ${scope.label}.`;
    case "symbols":
      return `Updated markup to ${markup} on ${count} selected symbol${count === 1 ? "" : "s"}.`;
  }
}

function toRequestBody(scope: SymbolsMarkupScope, markup: string) {
  switch (scope.type) {
    case "trading_server":
      return { markup };
    case "server_group":
      return { markup, server_group_id: scope.serverGroupId };
    case "security":
      return { markup, security_id: scope.securityId };
    case "symbols":
      return { markup, symbol_ids: scope.symbolIds };
  }
}

export function SetSymbolsMarkupDialog({
  open,
  onOpenChange,
  tradingServerId,
  scope,
  initialMarkup,
  onSuccess,
}: SetSymbolsMarkupDialogProps) {
  const [markup, setMarkup] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setMarkup(
      initialMarkup == null || initialMarkup === ""
        ? ""
        : formatMarkup(initialMarkup),
    );
  }, [initialMarkup, open, scope]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!scope) {
      return;
    }

    const trimmed = markup.trim();

    if (trimmed === "" || !Number.isFinite(Number(trimmed))) {
      setError("Enter a numeric markup value.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await updateSymbolsMarkup(
        tradingServerId,
        toRequestBody(scope, trimmed),
      );
      onOpenChange(false);
      onSuccess(response.data, successMessage(scope, response.data));
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setError(null);
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set markup</DialogTitle>
          <DialogDescription>{scopeDescription(scope)}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <ApiErrorAlert title="Could not update markup" message={error} />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="symbol-markup">Markup</Label>
            <Input
              id="symbol-markup"
              type="number"
              step="any"
              value={markup}
              placeholder="e.g. 1.25"
              onChange={(event) => setMarkup(event.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !scope}>
              {submitting ? "Saving..." : "Apply markup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
