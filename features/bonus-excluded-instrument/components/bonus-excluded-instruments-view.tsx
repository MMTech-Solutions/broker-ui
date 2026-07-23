"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  draftToSyncInput,
  draftsSignature,
  excludedInstrumentFromApi,
  excludedInstrumentFromTradingSymbol,
} from "@/features/bonus-excluded-instrument/utils";
import type { ExcludedInstrumentDraft } from "@/features/bonus-excluded-instrument/types";
import {
  getBonusOffer,
  syncBonusExcludedInstruments,
} from "@/features/bonus-offer/api";
import {
  getBonusOfferTemplate,
  syncBonusOfferTemplateExcludedInstruments,
} from "@/features/bonus-offer-template/api";
import {
  listServerGroupSecurities,
  listServerGroupsForAdmin,
  listSecuritySymbols,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import type {
  ServerGroup,
  TradingServer,
  TradingSymbol,
} from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

type BonusExcludedInstrumentsViewProps = {
  mode: "template" | "offer";
};

export function BonusExcludedInstrumentsView({
  mode,
}: BonusExcludedInstrumentsViewProps) {
  const searchParams = useSearchParams();
  const templateIdFromUrl = searchParams.get("templateId") ?? "";
  const offerIdFromUrl = searchParams.get("offerId") ?? "";
  const entityId = mode === "template" ? templateIdFromUrl : offerIdFromUrl;

  const [entityName, setEntityName] = useState<string | null>(null);
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [linkedServerGroupIds, setLinkedServerGroupIds] = useState<
    string[] | null
  >(null);
  const [loadingEntity, setLoadingEntity] = useState(true);
  const [entityError, setEntityError] = useState<string | null>(null);

  const [assignedDrafts, setAssignedDrafts] = useState<ExcludedInstrumentDraft[]>(
    [],
  );
  const [initialSignature, setInitialSignature] = useState("");
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [assignedError, setAssignedError] = useState<string | null>(null);

  const [tradingServers, setTradingServers] = useState<TradingServer[]>([]);
  const [selectedTradingServerId, setSelectedTradingServerId] = useState("");
  const [serverGroups, setServerGroups] = useState<ServerGroup[]>([]);
  const [selectedServerGroupId, setSelectedServerGroupId] = useState("");
  const [catalogSymbols, setCatalogSymbols] = useState<TradingSymbol[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const selectedServerGroup = useMemo(
    () =>
      serverGroups.find((group) => group.id === selectedServerGroupId) ?? null,
    [serverGroups, selectedServerGroupId],
  );

  const selectedTradingServer = useMemo(
    () =>
      tradingServers.find((server) => server.id === selectedTradingServerId) ??
      null,
    [tradingServers, selectedTradingServerId],
  );

  const assignedKeys = useMemo(
    () => new Set(assignedDrafts.map((draft) => draft.key)),
    [assignedDrafts],
  );

  const filteredCatalogSymbols = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();

    return catalogSymbols.filter((symbol) => {
      const draftKey = selectedServerGroup
        ? excludedInstrumentFromTradingSymbol(symbol, selectedServerGroup).key
        : null;

      if (draftKey && assignedKeys.has(draftKey)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        symbol.name.toLowerCase().includes(query) ||
        symbol.alpha.toLowerCase().includes(query)
      );
    });
  }, [assignedKeys, catalogSearch, catalogSymbols, selectedServerGroup]);

  const isDirty = draftsSignature(assignedDrafts) !== initialSignature;

  const breadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { label: "Dashboard", href: "/" },
      {
        label: mode === "template" ? "Bonus offer templates" : "Bonus offers",
        href: mode === "template" ? "/bonus-offer-templates" : "/bonus-offers",
      },
      {
        label: entityName ?? "Excluded instruments",
        current: true,
      },
    ],
    [entityName, mode],
  );

  const loadEntity = useCallback(async () => {
    if (!entityId) {
      setEntityName(null);
      setPlatformId(null);
      setLinkedServerGroupIds(null);
      setEntityError(
        mode === "template"
          ? "Template ID is required."
          : "Offer ID is required.",
      );
      setLoadingEntity(false);
      return;
    }

    setLoadingEntity(true);
    setEntityError(null);

    try {
      if (mode === "template") {
        const response = await getBonusOfferTemplate(entityId);
        setEntityName(response.data.name);
        setPlatformId(response.data.platform_id);
        setLinkedServerGroupIds(null);
      } else {
        const response = await getBonusOffer(entityId);
        setEntityName(response.data.name);
        setPlatformId(response.data.platform_id);
        setLinkedServerGroupIds(
          (response.data.server_groups ?? []).map(
            (entry) => entry.server_group_id,
          ),
        );
      }
    } catch (loadError) {
      setEntityError(formatBrokerApiError(loadError));
      setEntityName(null);
      setPlatformId(null);
      setLinkedServerGroupIds(null);
    } finally {
      setLoadingEntity(false);
    }
  }, [entityId, mode]);

  const loadAssignedInstruments = useCallback(async () => {
    if (!entityId) {
      setAssignedDrafts([]);
      setInitialSignature("");
      setLoadingAssigned(false);
      return;
    }

    setLoadingAssigned(true);
    setAssignedError(null);

    try {
      const entityResponse =
        mode === "template"
          ? await getBonusOfferTemplate(entityId)
          : await getBonusOffer(entityId);

      const instruments = entityResponse.data.excluded_instruments ?? [];
      let drafts = instruments.map((instrument) =>
        excludedInstrumentFromApi(instrument),
      );

      const platformIdValue = entityResponse.data.platform_id;
      const serversResponse = await listTradingServersForAdmin({
        per_page: 100,
        platform_id: platformIdValue,
      });

      const groupsByServer = await Promise.all(
        serversResponse.data.map(async (server) => {
          const groupsResponse = await listServerGroupsForAdmin(server.id, {
            per_page: 100,
          });

          return groupsResponse.data;
        }),
      );

      const groupNames = new Map(
        groupsByServer.flat().map((group) => [group.id, group.name]),
      );

      drafts = drafts.map((draft) => ({
        ...draft,
        server_group_name:
          groupNames.get(draft.server_group_id) ?? draft.server_group_name,
      }));

      setAssignedDrafts(drafts);
      setInitialSignature(draftsSignature(drafts));
    } catch (loadError) {
      setAssignedError(formatBrokerApiError(loadError));
      setAssignedDrafts([]);
      setInitialSignature("");
    } finally {
      setLoadingAssigned(false);
    }
  }, [entityId, mode]);

  const loadTradingServers = useCallback(async (platformIdValue: string) => {
    try {
      const response = await listTradingServersForAdmin({
        per_page: 100,
        is_active: true,
        platform_id: platformIdValue,
      });
      const servers = [...response.data].sort((left, right) =>
        left.connection_signature.localeCompare(right.connection_signature),
      );
      setTradingServers(servers);
      setSelectedTradingServerId((current) => current || servers[0]?.id || "");
    } catch {
      setTradingServers([]);
      setSelectedTradingServerId("");
    }
  }, []);

  const loadServerGroups = useCallback(
    async (tradingServerId: string, allowedGroupIds: string[] | null) => {
      if (!tradingServerId) {
        setServerGroups([]);
        setSelectedServerGroupId("");
        return;
      }

      setCatalogError(null);

      try {
        const response = await listServerGroupsForAdmin(tradingServerId, {
          per_page: 100,
        });
        const allowedSet =
          allowedGroupIds == null ? null : new Set(allowedGroupIds);
        const groups = [...response.data]
          .filter((group) => allowedSet == null || allowedSet.has(group.id))
          .sort((left, right) => left.name.localeCompare(right.name));
        setServerGroups(groups);
        setSelectedServerGroupId((current) => {
          if (current && groups.some((group) => group.id === current)) {
            return current;
          }

          return groups[0]?.id ?? "";
        });
      } catch (loadError) {
        setCatalogError(formatBrokerApiError(loadError));
        setServerGroups([]);
        setSelectedServerGroupId("");
      }
    },
    [],
  );

  const loadCatalogSymbols = useCallback(
    async (tradingServerId: string, serverGroupId: string) => {
      if (!tradingServerId || !serverGroupId) {
        setCatalogSymbols([]);
        return;
      }

      setLoadingCatalog(true);
      setCatalogError(null);

      try {
        const securitiesResponse = await listServerGroupSecurities(
          tradingServerId,
          serverGroupId,
          { per_page: 100 },
        );

        const symbolResponses = await Promise.all(
          securitiesResponse.data.map((security) =>
            listSecuritySymbols(tradingServerId, security.id, {
              per_page: 100,
            }),
          ),
        );

        const uniqueSymbols = new Map<string, TradingSymbol>();

        for (const response of symbolResponses) {
          for (const symbol of response.data) {
            uniqueSymbols.set(symbol.id, symbol);
          }
        }

        setCatalogSymbols(
          Array.from(uniqueSymbols.values()).sort((left, right) =>
            left.name.localeCompare(right.name),
          ),
        );
      } catch (loadError) {
        setCatalogError(formatBrokerApiError(loadError));
        setCatalogSymbols([]);
      } finally {
        setLoadingCatalog(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadEntity();
    void loadAssignedInstruments();
  }, [loadAssignedInstruments, loadEntity]);

  useEffect(() => {
    if (!platformId) {
      setTradingServers([]);
      setSelectedTradingServerId("");
      return;
    }

    // Offer mode waits until linked server groups are known so the catalog
    // can be restricted to groups attached to the offer.
    if (mode === "offer" && linkedServerGroupIds == null) {
      return;
    }

    void loadTradingServers(platformId);
  }, [linkedServerGroupIds, loadTradingServers, mode, platformId]);

  useEffect(() => {
    void loadServerGroups(
      selectedTradingServerId,
      mode === "offer" ? linkedServerGroupIds : null,
    );
  }, [
    linkedServerGroupIds,
    loadServerGroups,
    mode,
    selectedTradingServerId,
  ]);

  useEffect(() => {
    void loadCatalogSymbols(selectedTradingServerId, selectedServerGroupId);
  }, [loadCatalogSymbols, selectedServerGroupId, selectedTradingServerId]);

  function handleAddSymbol(symbol: TradingSymbol) {
    if (!selectedServerGroup) {
      return;
    }

    const draft = excludedInstrumentFromTradingSymbol(symbol, selectedServerGroup);

    if (assignedKeys.has(draft.key)) {
      return;
    }

    setAssignedDrafts((current) => [...current, draft]);
    setSaveSuccess(null);
  }

  function handleRemoveInstrument(key: string) {
    setAssignedDrafts((current) =>
      current.filter((draft) => draft.key !== key),
    );
    setSaveSuccess(null);
  }

  async function handleSave() {
    if (!entityId) {
      return;
    }

    setSubmitting(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const instruments = assignedDrafts.map(draftToSyncInput);

      if (mode === "template") {
        await syncBonusOfferTemplateExcludedInstruments(entityId, {
          instruments,
        });
      } else {
        await syncBonusExcludedInstruments(entityId, { instruments });
      }

      await loadAssignedInstruments();
      setSaveSuccess("Excluded instruments saved successfully.");
    } catch (error) {
      setSaveError(formatBrokerApiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (!entityId) {
    return (
      <div className="p-4">
        <ApiErrorAlert
          message={
            mode === "template"
              ? "Open this page from a bonus offer template to manage excluded instruments."
              : "Open this page from a bonus offer to manage excluded instruments."
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref={
          mode === "template" ? "/bonus-offer-templates" : "/bonus-offers"
        }
        backLabel={
          mode === "template" ? "Back to templates" : "Back to offers"
        }
      >
        <Button
          onClick={() => void handleSave()}
          disabled={!isDirty || submitting || loadingAssigned}
        >
          {submitting ? "Saving..." : "Save exclusions"}
        </Button>
      </PageContentToolbar>

      {entityError ? <ApiErrorAlert message={entityError} /> : null}
      {assignedError ? <ApiErrorAlert message={assignedError} /> : null}
      {saveError ? <ApiErrorAlert message={saveError} /> : null}

      {saveSuccess ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
          {saveSuccess}
        </p>
      ) : null}

      {loadingEntity ? (
        <Skeleton className="h-16 w-full max-w-2xl" />
      ) : entityName ? (
        <section className="rounded-xl border p-4">
          <p className="font-medium">{entityName}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse symbols by server group on the left and add them to the
            exclusion list on the right. Exclusions are stored by symbol ID;
            conversion activity skips positions whose ticker matches the
            frozen symbol alpha
            {mode === "offer"
              ? ". Only server groups linked to this offer can be used."
              : "."}
          </p>
        </section>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden xl:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-3 xl:w-80 xl:max-w-80">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">Symbol catalog</h2>
            <p className="text-xs text-muted-foreground">
              Browse symbols by server group and add them to exclusions.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="bonus-trading-server-select">Trading server</Label>
            <Select
              value={selectedTradingServerId}
              onValueChange={(value) => {
                setSelectedTradingServerId(value ?? "");
                setSelectedServerGroupId("");
                setCatalogSymbols([]);
              }}
            >
              <SelectTrigger id="bonus-trading-server-select" className="w-full">
                <SelectValue placeholder="Select trading server">
                  {selectedTradingServer?.connection_signature ?? null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tradingServers.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.connection_signature}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border">
            <div className="border-b p-3">
              <p className="text-sm font-medium">Server groups</p>
              <p className="text-xs text-muted-foreground">
                Select a group to browse its symbols
                {mode === "offer"
                  ? " (only groups linked to this offer)."
                  : "."}
              </p>
            </div>

            <div className="max-h-44 overflow-y-auto border-b p-2">
              {serverGroups.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  {mode === "offer"
                    ? "No linked server groups for this trading server. Link server groups to the offer first."
                    : "No server groups available."}
                </p>
              ) : (
                <div className="space-y-1">
                  {serverGroups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedServerGroupId(group.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        selectedServerGroupId === group.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted",
                        !group.is_active && "text-muted-foreground",
                      )}
                    >
                      <span className="truncate">{group.name}</span>
                      {!group.is_active ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            selectedServerGroupId === group.id &&
                              "border-primary-foreground/40 text-primary-foreground",
                          )}
                        >
                          Inactive
                        </Badge>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {selectedServerGroup
                    ? `Symbols in ${selectedServerGroup.name}`
                    : "Symbols"}
                </p>
              </div>

              <Input
                value={catalogSearch}
                onChange={(event) => setCatalogSearch(event.target.value)}
                placeholder="Search symbol"
                disabled={!selectedServerGroupId}
              />

              {catalogError ? <ApiErrorAlert message={catalogError} /> : null}

              <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
                {loadingCatalog ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton
                        key={`catalog-skeleton-${index}`}
                        className="h-10 w-full"
                      />
                    ))}
                  </div>
                ) : !selectedServerGroupId ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    Select a server group to list symbols.
                  </p>
                ) : filteredCatalogSymbols.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    No available symbols in this server group.
                  </p>
                ) : (
                  <div className="divide-y">
                    {filteredCatalogSymbols.map((symbol) => (
                      <div
                        key={symbol.id}
                        className="flex items-center justify-between gap-2 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {symbol.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {symbol.alpha}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          onClick={() => handleAddSymbol(symbol)}
                        >
                          <PlusIcon />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[520px] min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Excluded instruments</h2>
              <p className="text-xs text-muted-foreground">
                {assignedDrafts.length} instrument
                {assignedDrafts.length === 1 ? "" : "s"} excluded.
              </p>
            </div>
            {isDirty ? <Badge variant="outline">Unsaved changes</Badge> : null}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Server group</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAssigned
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={`assigned-skeleton-${index}`}>
                        <TableCell colSpan={3}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loadingAssigned && assignedDrafts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No excluded instruments yet. Add symbols from the catalog.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loadingAssigned
                  ? assignedDrafts.map((draft) => (
                      <TableRow key={draft.key}>
                        <TableCell>
                          <p className="font-medium">{draft.symbol_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {draft.symbol_alpha || draft.symbol_id.slice(0, 8)}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {draft.server_group_name ||
                            draft.server_group_id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip={`Remove ${draft.symbol_name}`}
                            onClick={() => handleRemoveInstrument(draft.key)}
                          >
                            <Trash2Icon />
                          </ActionTooltipButton>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
