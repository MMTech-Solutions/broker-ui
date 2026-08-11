"use client";

import { useEffect, useMemo, useState } from "react";

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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createClientTradingAccount } from "@/features/client-trading-account/api";
import {
  formatInitialAmount,
  serverGroupNeedsInitialAmount,
} from "@/features/client-trading-account/format";
import type {
  ClientAccountCatalog,
  ClientServerGroup,
  TradingAccount,
} from "@/features/client-trading-account/types";
import type { Leverage } from "@/features/leverage/types";
import type { Platform } from "@/features/platform/types";
import { listCatalogServerGroupLeverages } from "@/features/trading-server/api";
import { serverGroupDisplayName } from "@/features/trading-server/format";
import { TRADING_SERVER_ENVIRONMENT } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type ClientTradingAccountCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: ClientAccountCatalog | null;
  onSuccess: (account: TradingAccount) => void;
};

type SelectableCardProps = {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
};

function SelectableCard({
  selected,
  disabled,
  onSelect,
  children,
  className,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex min-w-0 flex-col rounded-xl border bg-card p-4 text-left shadow-sm transition-colors",
        "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

function PlatformCardMedia({
  platform,
  title,
}: {
  platform: Platform;
  title: string;
}) {
  if (platform.image_path) {
    return (
      <img
        src={platform.image_path}
        alt=""
        className="size-12 shrink-0 rounded-lg object-contain"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-medium text-muted-foreground"
    >
      {title.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function ClientTradingAccountCreateDialog({
  open,
  onOpenChange,
  catalog,
  onSuccess,
}: ClientTradingAccountCreateDialogProps) {
  const [environment, setEnvironment] = useState<string>(
    String(TRADING_SERVER_ENVIRONMENT.DEMO),
  );
  const [platformId, setPlatformId] = useState("");
  const [serverGroupId, setServerGroupId] = useState("");
  const [leverageId, setLeverageId] = useState("");
  const [amountId, setAmountId] = useState("");
  const [groupLeverages, setGroupLeverages] = useState<Leverage[]>([]);
  const [loadingLeverages, setLoadingLeverages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const environmentValue = Number.parseInt(environment, 10);

  const platformsForEnvironment = useMemo(() => {
    if (!catalog) {
      return [];
    }

    const platformIds = new Set(
      catalog.serverGroups
        .filter((group) => group.environment === environmentValue)
        .map((group) => group.platform?.id)
        .filter((id): id is string => Boolean(id)),
    );

    return catalog.platforms.filter((platform) => platformIds.has(platform.id));
  }, [catalog, environmentValue]);

  const filteredServerGroups = useMemo(() => {
    if (!catalog || !platformId) {
      return [];
    }

    return catalog.serverGroups.filter(
      (group) =>
        group.environment === environmentValue &&
        group.platform?.id === platformId,
    );
  }, [catalog, environmentValue, platformId]);

  const selectedServerGroup = useMemo<ClientServerGroup | null>(() => {
    if (!serverGroupId || !catalog) {
      return null;
    }

    return catalog.serverGroupById.get(serverGroupId) ?? null;
  }, [catalog, serverGroupId]);

  const showInitialAmountPicker =
    selectedServerGroup != null &&
    serverGroupNeedsInitialAmount(selectedServerGroup, environmentValue);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setEnvironment(String(TRADING_SERVER_ENVIRONMENT.DEMO));
    setPlatformId("");
    setServerGroupId("");
    setLeverageId("");
    setAmountId("");
    setGroupLeverages([]);
  }, [open]);

  useEffect(() => {
    if (!open || !catalog) {
      return;
    }

    setPlatformId((current) => {
      if (platformsForEnvironment.some((platform) => platform.id === current)) {
        return current;
      }

      return platformsForEnvironment[0]?.id ?? "";
    });
  }, [catalog, environmentValue, open, platformsForEnvironment]);

  useEffect(() => {
    if (!open || !catalog || !platformId) {
      setServerGroupId("");
      return;
    }

    const groups = catalog.serverGroups.filter(
      (group) =>
        group.environment === environmentValue &&
        group.platform?.id === platformId,
    );

    setServerGroupId((current) => {
      if (current && groups.some((group) => group.id === current)) {
        return current;
      }

      return groups[0]?.id ?? "";
    });
  }, [catalog, environmentValue, open, platformId]);

  useEffect(() => {
    if (!open || !serverGroupId) {
      setGroupLeverages([]);
      setLeverageId("");
      return;
    }

    let cancelled = false;

    async function loadLeverages() {
      setLoadingLeverages(true);
      setError(null);

      try {
        const response = await listCatalogServerGroupLeverages(serverGroupId, {
          per_page: 100,
        });

        if (!cancelled) {
          setGroupLeverages(response.data);
          setLeverageId(response.data[0]?.id ?? "");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setGroupLeverages([]);
          setLeverageId("");
        }
      } finally {
        if (!cancelled) {
          setLoadingLeverages(false);
        }
      }
    }

    void loadLeverages();

    return () => {
      cancelled = true;
    };
  }, [open, serverGroupId]);

  useEffect(() => {
    if (!showInitialAmountPicker || !catalog) {
      setAmountId("");
      return;
    }

    setAmountId(catalog.initialAmounts[0]?.id ?? "");
  }, [catalog, showInitialAmountPicker]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!serverGroupId || !leverageId) {
      setError("Selecciona grupo de servidor y apalancamiento.");
      return;
    }

    if (showInitialAmountPicker && !amountId) {
      setError("Selecciona un monto inicial para la cuenta demo.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await createClientTradingAccount({
        server_group_id: serverGroupId,
        leverage_id: leverageId,
        amount_id: showInitialAmountPicker ? amountId : undefined,
      });

      onOpenChange(false);
      onSuccess(response.data);
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Nueva cuenta de trading</DialogTitle>
          <DialogDescription>
            Crea una cuenta live o demo eligiendo entorno, plataforma, grupo de
            servidor y apalancamiento.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="No se pudo crear la cuenta"
                message={error}
              />
            ) : null}

            {!catalog ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`create-skeleton-${index}`}
                    className="h-20 w-full rounded-xl"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <Label>Entorno</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectableCard
                      selected={
                        environmentValue === TRADING_SERVER_ENVIRONMENT.DEMO
                      }
                      disabled={submitting}
                      onSelect={() =>
                        setEnvironment(String(TRADING_SERVER_ENVIRONMENT.DEMO))
                      }
                    >
                      <span className="text-sm font-medium">Demo</span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        Cuenta de práctica sin fondos reales.
                      </span>
                    </SelectableCard>
                    <SelectableCard
                      selected={
                        environmentValue === TRADING_SERVER_ENVIRONMENT.LIVE
                      }
                      disabled={submitting}
                      onSelect={() =>
                        setEnvironment(String(TRADING_SERVER_ENVIRONMENT.LIVE))
                      }
                    >
                      <span className="text-sm font-medium">Live</span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        Cuenta real para operar con tu capital.
                      </span>
                    </SelectableCard>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Plataforma</Label>
                  {platformsForEnvironment.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay plataformas disponibles para este entorno.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {platformsForEnvironment.map((platform) => {
                        const title = platform.custom_name ?? platform.name;

                        return (
                          <SelectableCard
                            key={platform.id}
                            selected={platform.id === platformId}
                            disabled={submitting}
                            onSelect={() => setPlatformId(platform.id)}
                            className="flex-row items-start gap-3"
                          >
                            <PlatformCardMedia
                              platform={platform}
                              title={title}
                            />
                            <span className="min-w-0 flex-1 space-y-1">
                              <span className="block truncate text-sm font-medium">
                                {title}
                              </span>
                              {platform.description ? (
                                <span className="line-clamp-2 block text-xs text-muted-foreground">
                                  {platform.description}
                                </span>
                              ) : null}
                            </span>
                          </SelectableCard>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Grupo de servidor</Label>
                  {filteredServerGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Selecciona una plataforma para ver los grupos
                      disponibles.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredServerGroups.map((group) => (
                        <SelectableCard
                          key={group.id}
                          selected={group.id === serverGroupId}
                          disabled={submitting}
                          onSelect={() => setServerGroupId(group.id)}
                        >
                          <span className="block truncate text-sm font-medium">
                            {serverGroupDisplayName(group)}
                          </span>
                          {group.description ? (
                            <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                              {group.description}
                            </span>
                          ) : null}
                        </SelectableCard>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Apalancamiento</Label>
                  {loadingLeverages ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                          key={`leverage-skeleton-${index}`}
                          className="h-16 w-full rounded-xl"
                        />
                      ))}
                    </div>
                  ) : groupLeverages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay apalancamientos para el grupo seleccionado.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {groupLeverages.map((leverage) => (
                        <SelectableCard
                          key={leverage.id}
                          selected={leverage.id === leverageId}
                          disabled={submitting}
                          onSelect={() => setLeverageId(leverage.id)}
                        >
                          <span className="block truncate text-sm font-medium">
                            {leverage.name}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {leverage.value}
                          </span>
                        </SelectableCard>
                      ))}
                    </div>
                  )}
                </div>

                {showInitialAmountPicker ? (
                  <div className="space-y-3">
                    <Label>Monto inicial demo</Label>
                    {catalog.initialAmounts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No hay montos iniciales configurados.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-3">
                        {catalog.initialAmounts.map((amount) => (
                          <SelectableCard
                            key={amount.id}
                            selected={amount.id === amountId}
                            disabled={submitting}
                            onSelect={() => setAmountId(amount.id)}
                          >
                            <span className="text-sm font-medium">
                              {formatInitialAmount(amount.amount)}
                            </span>
                          </SelectableCard>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Requerido en demo cuando el grupo no define monto por
                      defecto.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <DialogFooter className="mt-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !catalog}>
              {submitting ? "Creando..." : "Crear cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
