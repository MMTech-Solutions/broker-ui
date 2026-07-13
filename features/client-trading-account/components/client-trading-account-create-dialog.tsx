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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createClientTradingAccount,
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
import { listServerGroupLeverages } from "@/features/trading-server/api";
import { TRADING_SERVER_ENVIRONMENT } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientTradingAccountCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: ClientAccountCatalog | null;
  onSuccess: (account: TradingAccount) => void;
};

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
  const [tradingServerId, setTradingServerId] = useState("");
  const [serverGroupId, setServerGroupId] = useState("");
  const [leverageId, setLeverageId] = useState("");
  const [amountId, setAmountId] = useState("");
  const [groupLeverages, setGroupLeverages] = useState<Leverage[]>([]);
  const [loadingLeverages, setLoadingLeverages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const environmentValue = Number.parseInt(environment, 10);

  const filteredTradingServers = useMemo(() => {
    if (!catalog) {
      return [];
    }

    return catalog.tradingServers.filter((server) => {
      if (server.environment !== environmentValue) {
        return false;
      }

      if (platformId) {
        return server.platform_id === platformId;
      }

      return true;
    });
  }, [catalog, environmentValue, platformId]);

  const filteredServerGroups = useMemo(() => {
    if (!catalog || !tradingServerId) {
      return [];
    }

    return catalog.serverGroups.filter(
      (group) => group.trading_server_id === tradingServerId,
    );
  }, [catalog, tradingServerId]);

  const selectedServerGroup = useMemo<ClientServerGroup | null>(() => {
    if (!serverGroupId || !catalog) {
      return null;
    }

    return catalog.serverGroupById.get(serverGroupId) ?? null;
  }, [catalog, serverGroupId]);

  const showInitialAmountPicker =
    selectedServerGroup != null &&
    serverGroupNeedsInitialAmount(selectedServerGroup, environmentValue);

  const selectedPlatform = useMemo(
    () => catalog?.platforms.find((platform) => platform.id === platformId),
    [catalog, platformId],
  );

  const selectedTradingServer = useMemo(
    () =>
      filteredTradingServers.find((server) => server.id === tradingServerId),
    [filteredTradingServers, tradingServerId],
  );

  const selectedLeverage = useMemo(
    () => groupLeverages.find((leverage) => leverage.id === leverageId),
    [groupLeverages, leverageId],
  );

  const selectedInitialAmount = useMemo(
    () => catalog?.initialAmounts.find((amount) => amount.id === amountId),
    [amountId, catalog],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setEnvironment(String(TRADING_SERVER_ENVIRONMENT.DEMO));
    setPlatformId(catalog?.platforms[0]?.id ?? "");
    setTradingServerId("");
    setServerGroupId("");
    setLeverageId("");
    setAmountId("");
    setGroupLeverages([]);
  }, [catalog?.platforms, open]);

  useEffect(() => {
    if (!open || !catalog) {
      return;
    }

    const servers = catalog.tradingServers.filter(
      (server) =>
        server.environment === environmentValue &&
        (!platformId || server.platform_id === platformId),
    );

    setTradingServerId(servers[0]?.id ?? "");
  }, [catalog, environmentValue, open, platformId]);

  useEffect(() => {
    if (!open || !catalog || !tradingServerId) {
      setServerGroupId("");
      return;
    }

    const groups = catalog.serverGroups.filter(
      (group) => group.trading_server_id === tradingServerId,
    );

    setServerGroupId(groups[0]?.id ?? "");
  }, [catalog, open, tradingServerId]);

  useEffect(() => {
    if (!open || !tradingServerId || !serverGroupId) {
      setGroupLeverages([]);
      setLeverageId("");
      return;
    }

    let cancelled = false;

    async function loadLeverages() {
      setLoadingLeverages(true);
      setError(null);

      try {
        const response = await listServerGroupLeverages(
          tradingServerId,
          serverGroupId,
          { per_page: 100 },
        );

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
  }, [open, serverGroupId, tradingServerId]);

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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>Nueva cuenta de trading</DialogTitle>
          <DialogDescription>
            Crea una cuenta live o demo eligiendo plataforma, servidor, grupo y
            apalancamiento.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title="No se pudo crear la cuenta"
                message={error}
              />
            ) : null}

            {!catalog ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`create-skeleton-${index}`} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="create-account-environment">Entorno</Label>
                  <Select
                    value={environment}
                    onValueChange={setEnvironment}
                    disabled={submitting}
                  >
                    <SelectTrigger id="create-account-environment">
                      <SelectValue>
                        {environmentValue === TRADING_SERVER_ENVIRONMENT.LIVE
                          ? "Live"
                          : "Demo"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={String(TRADING_SERVER_ENVIRONMENT.DEMO)}
                      >
                        Demo
                      </SelectItem>
                      <SelectItem
                        value={String(TRADING_SERVER_ENVIRONMENT.LIVE)}
                      >
                        Live
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-account-platform">Plataforma</Label>
                  <Select
                    value={platformId}
                    onValueChange={setPlatformId}
                    disabled={submitting}
                  >
                    <SelectTrigger id="create-account-platform">
                      <SelectValue placeholder="Selecciona plataforma">
                        {selectedPlatform
                          ? (selectedPlatform.custom_name ?? selectedPlatform.name)
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.custom_name ?? platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-account-server">Trading server</Label>
                  <Select
                    value={tradingServerId}
                    onValueChange={setTradingServerId}
                    disabled={submitting || filteredTradingServers.length === 0}
                  >
                    <SelectTrigger id="create-account-server">
                      <SelectValue placeholder="Selecciona servidor">
                        {selectedTradingServer?.connection_signature ?? null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTradingServers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                          {server.connection_signature}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-account-group">Grupo de servidor</Label>
                  <Select
                    value={serverGroupId}
                    onValueChange={setServerGroupId}
                    disabled={submitting || filteredServerGroups.length === 0}
                  >
                    <SelectTrigger id="create-account-group">
                      <SelectValue placeholder="Selecciona grupo">
                        {selectedServerGroup?.name ?? null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {filteredServerGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-account-leverage">Apalancamiento</Label>
                  {loadingLeverages ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={leverageId}
                      onValueChange={setLeverageId}
                      disabled={submitting || groupLeverages.length === 0}
                    >
                      <SelectTrigger id="create-account-leverage">
                        <SelectValue placeholder="Selecciona apalancamiento">
                          {selectedLeverage
                            ? `${selectedLeverage.name} (${selectedLeverage.value})`
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {groupLeverages.map((leverage) => (
                          <SelectItem key={leverage.id} value={leverage.id}>
                            {leverage.name} ({leverage.value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {showInitialAmountPicker ? (
                  <div className="space-y-2">
                    <Label htmlFor="create-account-amount">
                      Monto inicial demo
                    </Label>
                    <Select
                      value={amountId}
                      onValueChange={setAmountId}
                      disabled={
                        submitting || catalog.initialAmounts.length === 0
                      }
                    >
                      <SelectTrigger id="create-account-amount">
                        <SelectValue placeholder="Selecciona monto">
                          {selectedInitialAmount
                            ? formatInitialAmount(selectedInitialAmount.amount)
                            : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {catalog.initialAmounts.map((amount) => (
                          <SelectItem key={amount.id} value={amount.id}>
                            {formatInitialAmount(amount.amount)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
