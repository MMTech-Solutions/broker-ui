"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

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
  listAllIbProgramSymbols,
  syncIbProgramSymbols,
} from "@/features/ib-program-symbol/api";
import { IbProgramSymbolConfigSheet } from "@/features/ib-program-symbol/components/ib-program-symbol-config-sheet";
import {
  draftToSyncInput,
  draftsSignature,
  programSymbolFromApi,
  programSymbolFromTradingSymbol,
  summarizeSymbolFlags,
  validateProgramSymbolDraft,
} from "@/features/ib-program-symbol/symbols-utils";
import type { ProgramSymbolDraft } from "@/features/ib-program-symbol/types";
import { listIbPaymentTemplates } from "@/features/ib-payment-template/api";
import type { IbPaymentTemplate } from "@/features/ib-payment-template/types";
import { listIbPrograms } from "@/features/ib-program/api";
import type { IbProgram } from "@/features/ib-program/types";
import {
  listServerGroupSecurities,
  listServerGroupsForAdmin,
  listSecuritySymbols,
  listTradingServersForAdmin,
} from "@/features/trading-server/api";
import type { ServerGroup, TradingServer, TradingSymbol } from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

export function IbProgramSymbolsView() {
  const searchParams = useSearchParams();
  const programIdFromUrl = searchParams.get("programId") ?? "";

  const [program, setProgram] = useState<IbProgram | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [programError, setProgramError] = useState<string | null>(null);

  const [assignedDrafts, setAssignedDrafts] = useState<ProgramSymbolDraft[]>([]);
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

  const [paymentTemplates, setPaymentTemplates] = useState<IbPaymentTemplate[]>(
    [],
  );

  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [configOpen, setConfigOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<ProgramSymbolDraft | null>(
    null,
  );

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

  const assignedSymbolIds = useMemo(
    () => new Set(assignedDrafts.map((draft) => draft.symbol_id)),
    [assignedDrafts],
  );

  const filteredCatalogSymbols = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();

    return catalogSymbols.filter((symbol) => {
      if (assignedSymbolIds.has(symbol.id)) {
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
  }, [assignedSymbolIds, catalogSearch, catalogSymbols]);

  const paymentTemplateNames = useMemo(
    () =>
      Object.fromEntries(
        paymentTemplates.map((template) => [template.id, template.name]),
      ),
    [paymentTemplates],
  );

  const isDirty = draftsSignature(assignedDrafts) !== initialSignature;

  const breadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { label: "Dashboard", href: "/" },
      { label: "IB Programs", href: "/ib-programs" },
      {
        label: program?.name ?? "Program symbols",
        current: true,
      },
    ],
    [program?.name],
  );

  const loadProgram = useCallback(async () => {
    if (!programIdFromUrl) {
      setProgram(null);
      setProgramError("Program ID is required.");
      setLoadingProgram(false);
      return;
    }

    setLoadingProgram(true);
    setProgramError(null);

    try {
      const response = await listIbPrograms({ per_page: 100 });
      const matchedProgram =
        response.data.find((entry) => entry.id === programIdFromUrl) ?? null;

      if (!matchedProgram) {
        setProgramError("IB program not found.");
        setProgram(null);
        return;
      }

      setProgram(matchedProgram);
    } catch (loadError) {
      setProgramError(formatBrokerApiError(loadError));
      setProgram(null);
    } finally {
      setLoadingProgram(false);
    }
  }, [programIdFromUrl]);

  const loadAssignedSymbols = useCallback(async () => {
    if (!programIdFromUrl) {
      setAssignedDrafts([]);
      setInitialSignature("");
      setLoadingAssigned(false);
      return;
    }

    setLoadingAssigned(true);
    setAssignedError(null);

    try {
      const symbols = await listAllIbProgramSymbols(programIdFromUrl);
      const drafts = symbols.map(programSymbolFromApi);
      setAssignedDrafts(drafts);
      setInitialSignature(draftsSignature(drafts));
    } catch (loadError) {
      setAssignedError(formatBrokerApiError(loadError));
      setAssignedDrafts([]);
      setInitialSignature("");
    } finally {
      setLoadingAssigned(false);
    }
  }, [programIdFromUrl]);

  const loadTradingServers = useCallback(async () => {
    try {
      const response = await listTradingServersForAdmin({ per_page: 100, is_active: true });
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

  const loadServerGroups = useCallback(async (tradingServerId: string) => {
    if (!tradingServerId) {
      setServerGroups([]);
      setSelectedServerGroupId("");
      return;
    }

    setCatalogError(null);

    try {
      const response = await listServerGroupsForAdmin(tradingServerId, { per_page: 100 });
      const groups = [...response.data].sort((left, right) =>
        left.name.localeCompare(right.name),
      );
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
  }, []);

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

  const loadPaymentTemplates = useCallback(async () => {
    try {
      const response = await listIbPaymentTemplates({ per_page: 100 });
      setPaymentTemplates(response.data);
    } catch {
      setPaymentTemplates([]);
    }
  }, []);

  useEffect(() => {
    void loadProgram();
    void loadAssignedSymbols();
    void loadTradingServers();
    void loadPaymentTemplates();
  }, [
    loadAssignedSymbols,
    loadPaymentTemplates,
    loadProgram,
    loadTradingServers,
  ]);

  useEffect(() => {
    void loadServerGroups(selectedTradingServerId);
  }, [loadServerGroups, selectedTradingServerId]);

  useEffect(() => {
    void loadCatalogSymbols(selectedTradingServerId, selectedServerGroupId);
  }, [loadCatalogSymbols, selectedServerGroupId, selectedTradingServerId]);

  function handleAddSymbol(symbol: TradingSymbol) {
    if (assignedSymbolIds.has(symbol.id)) {
      return;
    }

    setAssignedDrafts((current) => [
      ...current,
      programSymbolFromTradingSymbol(symbol),
    ]);
    setSaveSuccess(null);
  }

  function handleRemoveSymbol(symbolId: string) {
    setAssignedDrafts((current) =>
      current.filter((draft) => draft.symbol_id !== symbolId),
    );
    setSaveSuccess(null);
  }

  function openConfigSheet(draft: ProgramSymbolDraft) {
    setSelectedDraft(draft);
    setConfigOpen(true);
  }

  function handleConfigSave(updatedDraft: ProgramSymbolDraft) {
    setAssignedDrafts((current) =>
      current.map((draft) =>
        draft.symbol_id === updatedDraft.symbol_id ? updatedDraft : draft,
      ),
    );
    setSaveSuccess(null);
  }

  async function handleSave() {
    if (!programIdFromUrl) {
      return;
    }

    for (const draft of assignedDrafts) {
      const validationError = validateProgramSymbolDraft(draft);

      if (validationError) {
        setSaveError(`${draft.symbol_name}: ${validationError}`);
        return;
      }
    }

    setSubmitting(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await syncIbProgramSymbols(programIdFromUrl, {
        symbols: assignedDrafts.map(draftToSyncInput),
      });

      await loadAssignedSymbols();
      setSaveSuccess("Program symbols saved successfully.");
    } catch (saveError) {
      setSaveError(formatBrokerApiError(saveError));
    } finally {
      setSubmitting(false);
    }
  }

  if (!programIdFromUrl) {
    return (
      <div className="p-4">
        <ApiErrorAlert message="Open this page from an IB program to manage its symbols." />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={breadcrumbs}
        backHref="/ib-programs"
        backLabel="Back to programs"
      >
        <Button
          onClick={() => void handleSave()}
          disabled={!isDirty || submitting || loadingAssigned}
        >
          {submitting ? "Saving..." : "Save symbols"}
        </Button>
      </PageContentToolbar>

      {programError ? <ApiErrorAlert message={programError} /> : null}
      {assignedError ? <ApiErrorAlert message={assignedError} /> : null}
      {saveError ? <ApiErrorAlert message={saveError} /> : null}

      {saveSuccess ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
          {saveSuccess}
        </p>
      ) : null}

      {loadingProgram ? (
        <Skeleton className="h-16 w-full max-w-2xl" />
      ) : program ? (
        <section className="rounded-xl border p-4">
          <p className="font-medium">{program.name}</p>
          <p className="text-sm text-muted-foreground">{program.description}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Add symbols from server groups on the left, then configure how each
            one participates in volume, progression, and CPA rules on the right.
          </p>
        </section>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden xl:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-3 xl:w-80 xl:max-w-80">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">Symbol catalog</h2>
            <p className="text-xs text-muted-foreground">
              Browse symbols by server group and add them to the program.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <Label htmlFor="trading-server-select">Trading server</Label>
            <Select
              value={selectedTradingServerId}
              onValueChange={(value) => {
                setSelectedTradingServerId(value ?? "");
                setSelectedServerGroupId("");
                setCatalogSymbols([]);
              }}
            >
              <SelectTrigger id="trading-server-select" className="w-full">
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
                Select a group to browse its symbols.
              </p>
            </div>

            <div className="max-h-44 overflow-y-auto border-b p-2">
              {serverGroups.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No server groups available.
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
                {selectedServerGroup ? (
                  <p className="text-xs text-muted-foreground">
                    Filtered by server group{" "}
                    <span className="font-medium text-foreground">
                      {selectedServerGroup.name}
                    </span>
                  </p>
                ) : null}
              </div>

              <Input
                value={catalogSearch}
                onChange={(event) => setCatalogSearch(event.target.value)}
                placeholder="Search symbol"
                disabled={!selectedServerGroupId}
              />

              {catalogError ? (
                <ApiErrorAlert message={catalogError} />
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border">
                {loadingCatalog ? (
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={`catalog-skeleton-${index}`} className="h-10 w-full" />
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
              <h2 className="text-sm font-medium">Program symbols</h2>
              <p className="text-xs text-muted-foreground">
                {assignedDrafts.length} symbol
                {assignedDrafts.length === 1 ? "" : "s"} associated with this
                program.
              </p>
            </div>
            {isDirty ? (
              <Badge variant="outline">Unsaved changes</Badge>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Volume config</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAssigned
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={`assigned-skeleton-${index}`}>
                        <TableCell colSpan={4}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loadingAssigned && assignedDrafts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No symbols associated yet. Add symbols from the catalog.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loadingAssigned
                  ? assignedDrafts.map((draft) => (
                      <TableRow key={draft.symbol_id}>
                        <TableCell>
                          <p className="font-medium">{draft.symbol_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {draft.symbol_alpha}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {summarizeSymbolFlags(draft)}
                        </TableCell>
                        <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                          {draft.use_for_volume_payment
                            ? `${draft.commission_value} ${draft.commission_type || "—"} · ${
                                paymentTemplateNames[
                                  draft.ib_payment_template_id
                                ] ?? "No template"
                              }`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip={`Configure ${draft.symbol_name}`}
                              onClick={() => openConfigSheet(draft)}
                            >
                              <PencilIcon />
                            </ActionTooltipButton>
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip={`Remove ${draft.symbol_name}`}
                              onClick={() => handleRemoveSymbol(draft.symbol_id)}
                            >
                              <Trash2Icon />
                            </ActionTooltipButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <IbProgramSymbolConfigSheet
        open={configOpen}
        onOpenChange={setConfigOpen}
        draft={selectedDraft}
        paymentTemplates={paymentTemplates}
        onSave={handleConfigSave}
      />
    </div>
  );
}
