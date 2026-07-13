"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, PencilIcon, PlusIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { ActionTooltipButton } from "@/components/feedback/action-tooltip-button";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { listIbPaymentTemplates } from "@/features/ib-payment-template/api";
import type { IbPaymentTemplate } from "@/features/ib-payment-template/types";
import { listIbPrograms } from "@/features/ib-program/api";
import type { IbProgram } from "@/features/ib-program/types";
import {
  listIbProgramCpaRules,
  listIbProgramPnlRules,
  listIbProgramVolumeRules,
  updateIbProgramCpaRule,
  updateIbProgramPnlRule,
  updateIbProgramVolumeRule,
} from "@/features/ib-program-payment-rule/api";
import { IbProgramPaymentRuleFormDialog } from "@/features/ib-program-payment-rule/components/ib-program-payment-rule-form-dialog";
import {
  formatAmount,
  formatDateTime,
} from "@/features/ib-program-payment-rule/format";
import {
  IB_PROGRAM_PAYMENT_RULE_TYPES,
  type IbProgramCpaRule,
  type IbProgramPaymentRuleType,
  type IbProgramPnlRule,
  type IbProgramVolumeRule,
} from "@/features/ib-program-payment-rule/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const ibProgramPaymentRulesBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Program payment rules", current: true },
];

type RuleRecord =
  | IbProgramVolumeRule
  | IbProgramPnlRule
  | IbProgramCpaRule;

export function IbProgramPaymentRulesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programIdFromUrl = searchParams.get("programId") ?? "";

  const [programs, setPrograms] = useState<IbProgram[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState(programIdFromUrl);
  const [selectedRuleType, setSelectedRuleType] =
    useState<IbProgramPaymentRuleType>("volume");

  const [rules, setRules] = useState<RuleRecord[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [activatingRuleId, setActivatingRuleId] = useState<string | null>(null);

  const [paymentTemplates, setPaymentTemplates] = useState<IbPaymentTemplate[]>(
    [],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedRule, setSelectedRule] = useState<RuleRecord | null>(null);

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === selectedProgramId) ?? null,
    [programs, selectedProgramId],
  );

  const selectedRuleTypeMeta = useMemo(
    () =>
      IB_PROGRAM_PAYMENT_RULE_TYPES.find(
        (entry) => entry.value === selectedRuleType,
      ) ?? IB_PROGRAM_PAYMENT_RULE_TYPES[0],
    [selectedRuleType],
  );

  const paymentTemplateNames = useMemo(
    () =>
      Object.fromEntries(
        paymentTemplates.map((template) => [template.id, template.name]),
      ),
    [paymentTemplates],
  );

  const loadPrograms = useCallback(async () => {
    setProgramsLoading(true);
    setProgramsError(null);

    try {
      const response = await listIbPrograms({ per_page: 100 });
      const nextPrograms = [...response.data].sort((left, right) => {
        if (left.is_active !== right.is_active) {
          return left.is_active ? -1 : 1;
        }

        return left.name.localeCompare(right.name);
      });
      setPrograms(nextPrograms);

      const preferredProgramId = programIdFromUrl;
      const resolvedProgramId =
        preferredProgramId &&
        nextPrograms.some((program) => program.id === preferredProgramId)
          ? preferredProgramId
          : nextPrograms[0]?.id ?? "";

      setSelectedProgramId(resolvedProgramId);
    } catch (loadError) {
      setProgramsError(formatBrokerApiError(loadError));
      setPrograms([]);
    } finally {
      setProgramsLoading(false);
    }
  }, [programIdFromUrl]);

  useEffect(() => {
    if (programsLoading || !programIdFromUrl) {
      return;
    }

    if (programs.some((program) => program.id === programIdFromUrl)) {
      setSelectedProgramId(programIdFromUrl);
    }
  }, [programIdFromUrl, programs, programsLoading]);

  function handleProgramChange(programId: string) {
    setSelectedProgramId(programId);

    const params = new URLSearchParams(searchParams.toString());

    if (programId) {
      params.set("programId", programId);
    } else {
      params.delete("programId");
    }

    const query = params.toString();
    router.replace(
      query ? `/ib-program-payment-rules?${query}` : "/ib-program-payment-rules",
      { scroll: false },
    );
  }

  const loadPaymentTemplates = useCallback(async () => {
    try {
      const response = await listIbPaymentTemplates({ per_page: 100 });
      setPaymentTemplates(response.data);
    } catch {
      setPaymentTemplates([]);
    }
  }, []);

  const loadRules = useCallback(async () => {
    if (!selectedProgramId) {
      setRules([]);
      return;
    }

    setRulesLoading(true);
    setRulesError(null);

    try {
      const filters = { per_page: 50 };

      if (selectedRuleType === "volume") {
        const response = await listIbProgramVolumeRules(
          selectedProgramId,
          filters,
        );
        setRules(response.data);
      } else if (selectedRuleType === "pnl") {
        const response = await listIbProgramPnlRules(
          selectedProgramId,
          filters,
        );
        setRules(response.data);
      } else {
        const response = await listIbProgramCpaRules(
          selectedProgramId,
          filters,
        );
        setRules(response.data);
      }
    } catch (loadError) {
      setRulesError(formatBrokerApiError(loadError));
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  }, [selectedProgramId, selectedRuleType]);

  useEffect(() => {
    void loadPrograms();
    void loadPaymentTemplates();
  }, [loadPrograms, loadPaymentTemplates]);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedRule(null);
    setFormOpen(true);
  }

  function openEditDialog(rule: RuleRecord) {
    setFormMode("edit");
    setSelectedRule(rule);
    setFormOpen(true);
  }

  async function handleActivate(rule: RuleRecord) {
    if (!selectedProgramId || rule.is_active) {
      return;
    }

    setActivatingRuleId(rule.id);
    setRulesError(null);

    try {
      if (selectedRuleType === "volume") {
        await updateIbProgramVolumeRule(selectedProgramId, rule.id, {
          is_active: true,
        });
      } else if (selectedRuleType === "pnl") {
        await updateIbProgramPnlRule(selectedProgramId, rule.id, {
          is_active: true,
        });
      } else {
        await updateIbProgramCpaRule(selectedProgramId, rule.id, {
          is_active: true,
        });
      }

      await loadRules();
    } catch (activateError) {
      setRulesError(formatBrokerApiError(activateError));
    } finally {
      setActivatingRuleId(null);
    }
  }

  function renderRuleDetails(rule: RuleRecord) {
    if (selectedRuleType === "pnl" && "ib_payment_template_id" in rule) {
      return (
        paymentTemplateNames[rule.ib_payment_template_id] ??
        rule.ib_payment_template_id
      );
    }

    if (selectedRuleType === "cpa" && "cpa_reward_amount" in rule) {
      return `Threshold ${formatAmount(rule.cpa_progression_volume_threshold)} · Min deposit ${formatAmount(rule.cpa_min_external_deposit_amount)} · Reward ${formatAmount(rule.cpa_reward_amount)}`;
    }

    return "Symbol rates configured per program symbol";
  }

  const hasActiveRule = rules.some((rule) => rule.is_active);

  const selectedProgramLabel = selectedProgram
    ? selectedProgram.name
    : selectedProgramId
      ? "Loading program..."
      : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={ibProgramPaymentRulesBreadcrumbs}>
        <Button
          type="button"
          onClick={openCreateDialog}
          disabled={!selectedProgramId || rulesLoading}
        >
          <PlusIcon />
          New {selectedRuleTypeMeta.label} rule
        </Button>
      </PageContentToolbar>

      {programsError ? <ApiErrorAlert message={programsError} /> : null}

      <section className="space-y-4 rounded-xl border p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="ib-program-select">IB program</Label>
            {programsLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : programs.length === 0 ? (
              <div className="flex h-8 items-center rounded-lg border px-2.5 text-sm text-muted-foreground">
                No IB programs available
              </div>
            ) : (
              <Select
                value={selectedProgramId}
                onValueChange={(value) => handleProgramChange(value ?? "")}
              >
                <SelectTrigger id="ib-program-select" className="w-full">
                  <SelectValue placeholder="Select an IB program">
                    {selectedProgramLabel ? (
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{selectedProgramLabel}</span>
                        {selectedProgram && !selectedProgram.is_active ? (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px]"
                          >
                            Inactive
                          </Badge>
                        ) : null}
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem
                      key={program.id}
                      value={program.id}
                      className={cn(
                        !program.is_active && "text-muted-foreground",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span>{program.name}</span>
                        {!program.is_active ? (
                          <Badge variant="outline" className="text-[10px]">
                            Inactive
                          </Badge>
                        ) : null}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm lg:justify-self-end">
            {selectedProgram ? (
              <p className="text-muted-foreground">
                {hasActiveRule ? (
                  <>
                    <span className="font-medium text-foreground">
                      {selectedRuleTypeMeta.label}
                    </span>{" "}
                    rule is active for{" "}
                    <span className="font-medium text-foreground">
                      {selectedProgram.name}
                    </span>
                    .
                  </>
                ) : (
                  <>
                    No active{" "}
                    <span className="font-medium text-foreground">
                      {selectedRuleTypeMeta.label}
                    </span>{" "}
                    rule for{" "}
                    <span className="font-medium text-foreground">
                      {selectedProgram.name}
                    </span>{" "}
                    yet.
                  </>
                )}
              </p>
            ) : (
              <p className="text-muted-foreground">
                Select a program to manage its payment rules.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <Label>Rule type</Label>
          <div className="inline-flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
            {IB_PROGRAM_PAYMENT_RULE_TYPES.map((ruleType) => (
              <Button
                key={ruleType.value}
                type="button"
                size="sm"
                variant={
                  selectedRuleType === ruleType.value ? "default" : "ghost"
                }
                className={cn(
                  "min-w-20",
                  selectedRuleType !== ruleType.value &&
                    "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setSelectedRuleType(ruleType.value)}
              >
                {ruleType.label}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedRuleTypeMeta.description}
          </p>
        </div>
      </section>

      {rulesError ? <ApiErrorAlert message={rulesError} /> : null}

      <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rulesLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}

              {!rulesLoading && rules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No {selectedRuleTypeMeta.label} rules for this program yet.
                  </TableCell>
                </TableRow>
              ) : null}

              {!rulesLoading
                ? rules.map((rule) => (
                    <TableRow
                      key={rule.id}
                      className={cn(
                        rule.is_active && "bg-primary/5",
                        !rule.is_active && "text-muted-foreground",
                      )}
                    >
                      <TableCell className="max-w-[220px] whitespace-normal">
                        {rule.description?.trim() || "—"}
                      </TableCell>
                      <TableCell className="max-w-[320px] whitespace-normal text-sm">
                        {renderRuleDetails(rule)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={rule.is_active ? "default" : "outline"}
                        >
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(rule.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!rule.is_active ? (
                            <ActionTooltipButton
                              variant="ghost"
                              size="icon-sm"
                              tooltip="Activate rule"
                              disabled={activatingRuleId === rule.id}
                              onClick={() => void handleActivate(rule)}
                            >
                              <CheckIcon />
                            </ActionTooltipButton>
                          ) : null}
                          <ActionTooltipButton
                            variant="ghost"
                            size="icon-sm"
                            tooltip="Edit rule"
                            onClick={() => openEditDialog(rule)}
                          >
                            <PencilIcon />
                          </ActionTooltipButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
      </div>

      {selectedProgramId ? (
        <IbProgramPaymentRuleFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={formMode}
          ruleType={selectedRuleType}
          ibProgramId={selectedProgramId}
          rule={selectedRule}
          paymentTemplates={paymentTemplates}
          onSuccess={() => void loadRules()}
        />
      ) : null}
    </div>
  );
}
