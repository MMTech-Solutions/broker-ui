"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, CopyIcon, ExternalLinkIcon, Share2Icon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createRiskMetricShare,
  getAccountRiskMetricShare,
  updateRiskMetricShare,
} from "@/features/client-risk-metrics/api";
import type { SharedRiskMetric } from "@/features/client-risk-metrics/types";
import { formatBrokerApiError } from "@/lib/api/errors";

function buildShareUrl(shareUuid: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/public/risk-metrics/${shareUuid}`;
}

type RiskMetricsShareDialogProps = {
  accountId: string;
};

export function RiskMetricsShareDialog({ accountId }: RiskMetricsShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState<SharedRiskMetric | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadShare = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAccountRiskMetricShare(accountId);
      setShare(response.data);
    } catch (err) {
      setError(formatBrokerApiError(err));
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadShare();
    });

    return () => {
      cancelled = true;
    };
  }, [open, loadShare]);

  async function handleEnable() {
    setSaving(true);
    setError(null);

    try {
      if (!share) {
        const response = await createRiskMetricShare({
          trading_account_id: accountId,
          expirable: false,
        });
        setShare(response.data);
      } else {
        const response = await updateRiskMetricShare(share.id, {
          status: "shared",
        });
        setShare(response.data);
      }
    } catch (err) {
      setError(formatBrokerApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDisable() {
    if (!share) return;

    setSaving(true);
    setError(null);

    try {
      const response = await updateRiskMetricShare(share.id, {
        status: "unshared",
      });
      setShare(response.data);
    } catch (err) {
      setError(formatBrokerApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyLink() {
    if (!share?.id) return;
    const url = buildShareUrl(share.id);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const isShared = share?.status === "shared";
  const shareUrl = share?.id ? buildShareUrl(share.id) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Share2Icon className="h-4 w-4" />
            Compartir métricas
          </Button>
        }
      />
      <DialogContent className="min-w-0 grid-cols-[minmax(0,1fr)] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir métricas</DialogTitle>
          <DialogDescription>
            Genera un enlace público para que otros puedan ver las métricas de esta cuenta sin necesidad de iniciar sesión.
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-4">
          {error ? (
            <ApiErrorAlert
              title="Error al gestionar el enlace"
              message={error}
            />
          ) : null}

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando estado del enlace…</p>
          ) : (
            <div className="min-w-0 space-y-3">
              <div className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium">Enlace público</p>
                  <p className="break-words text-xs text-muted-foreground">
                    {isShared ? "Activo — cualquier persona con el enlace puede ver las métricas" : "Desactivado"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  {isShared ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisable}
                      disabled={saving}
                    >
                      Desactivar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleEnable}
                      disabled={saving}
                    >
                      Activar
                    </Button>
                  )}
                </div>
              </div>

              {isShared && shareUrl ? (
                <div className="min-w-0 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Enlace para compartir</p>
                  <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-md border bg-muted/40 p-2">
                    <p className="min-w-0 flex-1 truncate text-xs tabular-nums">
                      {shareUrl}
                    </p>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleCopyLink}
                        aria-label="Copiar enlace"
                      >
                        {copied ? <CheckIcon className="h-3.5 w-3.5 text-emerald-500" /> : <CopyIcon className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => window.open(shareUrl, "_blank")}
                        aria-label="Abrir enlace"
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {share.visit_count !== undefined ? (
                    <p className="text-xs text-muted-foreground">
                      {share.visit_count} {share.visit_count === 1 ? "visita" : "visitas"}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter className="min-w-0" showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
