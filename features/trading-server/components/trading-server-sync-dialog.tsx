"use client";

import { useState } from "react";

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
import { syncTradingServer } from "@/features/trading-server/api";
import type { TradingServer } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type TradingServerSyncDialogProps = {
  tradingServer: TradingServer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
};

export function TradingServerSyncDialog({
  tradingServer,
  open,
  onOpenChange,
  onSuccess,
}: TradingServerSyncDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    if (!tradingServer) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await syncTradingServer(tradingServer.id);
      onOpenChange(false);
      onSuccess("Trading server synchronized successfully.");
    } catch (syncError) {
      setError(formatBrokerApiError(syncError));
    } finally {
      setSubmitting(false);
    }
  }

  const label = tradingServer
    ? String(
        tradingServer.config.host ??
          tradingServer.connection_id ??
          tradingServer.id,
      )
    : "trading server";

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
          <AlertDialogTitle>Synchronize trading server</AlertDialogTitle>
          <AlertDialogDescription>
            This will pull groups, securities, and symbols from{" "}
            <span className="font-medium text-foreground">{label}</span> into
            broker-service.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <ApiErrorAlert
            title="Could not synchronize trading server"
            message={error}
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void handleSync();
            }}
          >
            {submitting ? "Synchronizing..." : "Synchronize"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
