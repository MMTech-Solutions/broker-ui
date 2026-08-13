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
import {
  createClientTradingAccount,
  listClientServerGroupsForSelection,
} from "@/features/client-trading-account/api";
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
import {
  CLIENT_TRADING_TERM_ROWS,
  formatServerGroupTradingTermValue,
  getServerGroupTradingTerms,
  serverGroupDisplayName,
} from "@/features/trading-server/format";
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
  const [platformId, setPlatformId] = useState("");
  const [environment, setEnvironment] = useState<string>(
    String(TRADING_SERVER_ENVIRONMENT.DEMO),
  );
  const [serverGroupId, setServerGroupId] = useState("");
  const [leverageId, setLeverageId] = useState("");
  const [amountId, setAmountId] = useState("");
  const [serverGroups, setServerGroups] = useState<ClientServerGroup[]>([]);
  const [loadingServerGroups, setLoadingServerGroups] = useState(false);
  const [groupLeverages, setGroupLeverages] = useState<Leverage[]>([]);
  const [loadingLeverages, setLoadingLeverages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const environmentValue = Number.parseInt(environment, 10);

  const platforms = catalog?.platforms ?? [];

  const selectedServerGroup = useMemo<ClientServerGroup | null>(() => {
    if (!serverGroupId) {
      return null;
    }

    return serverGroups.find((group) => group.id === serverGroupId) ?? null;
  }, [serverGroupId, serverGroups]);

  const showInitialAmountPicker =
    selectedServerGroup != null &&
    serverGroupNeedsInitialAmount(selectedServerGroup, environmentValue);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setPlatformId("");
    setEnvironment(String(TRADING_SERVER_ENVIRONMENT.DEMO));
    setServerGroupId("");
    setLeverageId("");
    setAmountId("");
    setServerGroups([]);
    setGroupLeverages([]);
  }, [open]);

  useEffect(() => {
    if (!open || !catalog || platforms.length === 0) {
      return;
    }

    setPlatformId((current) => {
      if (platforms.some((platform) => platform.id === current)) {
        return current;
      }

      return platforms[0]?.id ?? "";
    });
  }, [catalog, open, platforms]);

  useEffect(() => {
    if (!open || !platformId) {
      setServerGroups([]);
      setServerGroupId("");
      return;
    }

    let cancelled = false;

    async function loadServerGroups() {
      setLoadingServerGroups(true);
      setError(null);

      try {
        const groups = await listClientServerGroupsForSelection({
          platformId,
          environment: environmentValue,
        });

        if (cancelled) {
          return;
        }

        setServerGroups(groups);
        setServerGroupId((current) => {
          if (current && groups.some((group) => group.id === current)) {
            return current;
          }

          return groups[0]?.id ?? "";
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setServerGroups([]);
          setServerGroupId("");
        }
      } finally {
        if (!cancelled) {
          setLoadingServerGroups(false);
        }
      }
    }

    void loadServerGroups();

    return () => {
      cancelled = true;
    };
  }, [environmentValue, open, platformId]);

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

    if (!platformId) {
      setError("Selecciona una plataforma.");
      return;
    }

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
            Elige plataforma, entorno, grupo de servidor y apalancamiento.
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
                  <Label>Plataforma</Label>
                  {platforms.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay plataformas configuradas.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {platforms.map((platform) => {
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
                  <Label>Entorno</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectableCard
                      selected={
                        environmentValue === TRADING_SERVER_ENVIRONMENT.DEMO
                      }
                      disabled={submitting || !platformId}
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
                      disabled={submitting || !platformId}
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
                  <Label>Grupo de servidor</Label>
                  {!platformId ? (
                    <p className="text-sm text-muted-foreground">
                      Selecciona una plataforma para ver los grupos
                      disponibles.
                    </p>
                  ) : loadingServerGroups ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton
                          key={`server-group-skeleton-${index}`}
                          className="h-36 w-full rounded-xl"
                        />
                      ))}
                    </div>
                  ) : serverGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay grupos disponibles para esta plataforma y entorno.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {serverGroups.map((group) => {
                        const terms = getServerGroupTradingTerms(
                          group.trading_terms,
                        );

                        return (
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
                            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                              {CLIENT_TRADING_TERM_ROWS.map(({ key, label }) => (
                                <div key={key} className="min-w-0">
                                  <dt className="text-muted-foreground">
                                    {label}
                                  </dt>
                                  <dd className="truncate font-medium">
                                    {formatServerGroupTradingTermValue(
                                      key,
                                      terms,
                                    )}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </SelectableCard>
                        );
                      })}
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
                      {serverGroupId
                        ? "No hay apalancamientos para el grupo seleccionado."
                        : "Selecciona un grupo de servidor."}
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
