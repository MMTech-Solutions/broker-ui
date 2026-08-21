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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { syncTradingServer } from "@/features/trading-server/api";
import type { TradingServer } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

export type TradingServerSyncNotice = {
  title: string;
  message: string;
};

type TradingServerSyncDialogProps = {
  tradingServer: TradingServer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (notice: TradingServerSyncNotice) => void;
};

export function TradingServerSyncDialog({
  tradingServer,
  open,
  onOpenChange,
  onSuccess,
}: TradingServerSyncDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asyncSync, setAsyncSync] = useState(true);

  async function handleSync() {
    if (!tradingServer) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await syncTradingServer(tradingServer.id, { async: asyncSync });
      onOpenChange(false);
      onSuccess(
        asyncSync
          ? {
              title: "Synchronization queued",
              message:
                "The synchronization was accepted and is running in the background. This UI does not receive an alert when it finishes; verify the TRADING_SERVER_SYNC_DONE event in the Kafka UI.",
            }
          : {
              title: "Synchronization complete",
              message: "Trading server synchronized successfully.",
            },
      );
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
          setAsyncSync(true);
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

        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="trading-server-sync-async"
              checked={asyncSync}
              disabled={submitting}
              onCheckedChange={setAsyncSync}
            />
            <div className="space-y-1">
              <Label htmlFor="trading-server-sync-async">
                Run asynchronously
              </Label>
              <p className="text-sm text-muted-foreground">
                {asyncSync
                  ? "The request will be queued and this dialog will close after broker-service accepts it."
                  : "The request will remain open until broker-service finishes the synchronization."}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Completion notifications are not available in this UI. To verify an
            asynchronous E2E run, check the Kafka UI for the
            TRADING_SERVER_SYNC_DONE event.
          </p>
        </div>

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
            {submitting
              ? asyncSync
                ? "Queueing..."
                : "Synchronizing..."
              : asyncSync
                ? "Start asynchronously"
                : "Synchronize now"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
