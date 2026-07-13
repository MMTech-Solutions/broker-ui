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
  contractClientAccountInsurance,
  listInsurancePlansForAccount,
} from "@/features/client-insurance/api";
import {
  formatAccountBalance,
  formatCoveragePercent,
  formatInsuranceMinorAmount,
  formatInsuranceOptionSummary,
  getContractableOptions,
} from "@/features/client-insurance/format";
import type {
  ClientAccountInsurance,
  ClientInsurancePlan,
} from "@/features/client-insurance/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type AccountTarget = {
  id: string;
  external_trader_id: string;
  current_balance: number;
  plans?: ClientInsurancePlan[];
};

type ClientInsuranceContractDialogProps = {
  account: AccountTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContracted: (insurance: ClientAccountInsurance) => void;
};

export function ClientInsuranceContractDialog({
  account,
  open,
  onOpenChange,
  onContracted,
}: ClientInsuranceContractDialogProps) {
  const [plans, setPlans] = useState<ClientInsurancePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractablePlans = useMemo(
    () => plans.filter((plan) => getContractableOptions(plan).length > 0),
    [plans],
  );

  const selectedPlan = contractablePlans.find(
    (plan) => plan.id === selectedPlanId,
  );

  const contractableOptions = selectedPlan
    ? getContractableOptions(selectedPlan)
    : [];

  const selectedOption = contractableOptions.find(
    (option) => option.id === selectedOptionId,
  );

  useEffect(() => {
    if (!open || !account) {
      return;
    }

    let cancelled = false;

    async function loadPlans() {
      if (!account) {
        return;
      }

      const targetAccount = account;

      setLoadingPlans(true);
      setError(null);
      setSelectedPlanId("");
      setSelectedOptionId("");

      try {
        if (targetAccount.plans && targetAccount.plans.length > 0) {
          if (!cancelled) {
            setPlans(targetAccount.plans);
            const firstPlan = targetAccount.plans.find(
              (plan) => getContractableOptions(plan).length > 0,
            );
            const firstOption = firstPlan
              ? getContractableOptions(firstPlan)[0]
              : undefined;
            setSelectedPlanId(firstPlan?.id ?? "");
            setSelectedOptionId(firstOption?.id ?? "");
          }
          return;
        }

        const response = await listInsurancePlansForAccount(targetAccount.id);

        if (cancelled) {
          return;
        }

        setPlans(response.data.plans);
        const firstPlan = response.data.plans.find(
          (plan) => getContractableOptions(plan).length > 0,
        );
        const firstOption = firstPlan
          ? getContractableOptions(firstPlan)[0]
          : undefined;
        setSelectedPlanId(firstPlan?.id ?? "");
        setSelectedOptionId(firstOption?.id ?? "");
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setPlans([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingPlans(false);
        }
      }
    }

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, [account, open]);

  useEffect(() => {
    if (!selectedPlan) {
      setSelectedOptionId("");
      return;
    }

    const options = getContractableOptions(selectedPlan);
    const stillValid = options.some((option) => option.id === selectedOptionId);

    if (!stillValid) {
      setSelectedOptionId(options[0]?.id ?? "");
    }
  }, [selectedPlan, selectedOptionId]);

  async function handleSubmit() {
    if (!account || !selectedOptionId) {
      setError("Selecciona un plan y una opción de cobertura.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await contractClientAccountInsurance({
        account_id: account.id,
        insurance_plan_option_id: selectedOptionId,
      });
      onContracted(response.data);
      onOpenChange(false);
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
          <DialogTitle>Contratar seguro</DialogTitle>
          <DialogDescription>
            {account
              ? `Aplica un seguro a la cuenta ${account.external_trader_id}.`
              : "Selecciona el plan y la cobertura para tu cuenta."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2">
          {error ? (
            <ApiErrorAlert
              title="No se pudo contratar el seguro"
              message={error}
            />
          ) : null}

          {account ? (
            <div className="rounded-lg border p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Cuenta:</span>{" "}
                <span className="font-medium">{account.external_trader_id}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Saldo actual:</span>{" "}
                <span className="font-medium tabular-nums">
                  {formatAccountBalance(account.current_balance)}
                </span>
              </p>
            </div>
          ) : null}

          {loadingPlans ? (
            <Skeleton className="h-24 w-full" />
          ) : contractablePlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Esta cuenta no tiene planes de seguro disponibles con tu saldo
              actual. Verifica que no tenga posiciones abiertas y que el saldo
              esté dentro de los límites del plan.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="insurance-plan">Plan</Label>
                <Select
                  value={selectedPlanId}
                  onValueChange={(value) => {
                    if (value) {
                      setSelectedPlanId(value);
                    }
                  }}
                  disabled={submitting}
                >
                  <SelectTrigger id="insurance-plan">
                    <SelectValue placeholder="Selecciona un plan">
                      {selectedPlan?.name ?? null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {contractablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlan?.description ? (
                  <p className="text-xs text-muted-foreground">
                    {selectedPlan.description}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance-option">Cobertura</Label>
                <Select
                  value={selectedOptionId}
                  onValueChange={(value) => {
                    if (value) {
                      setSelectedOptionId(value);
                    }
                  }}
                  disabled={submitting || contractableOptions.length === 0}
                >
                  <SelectTrigger id="insurance-option">
                    <SelectValue placeholder="Selecciona una opción">
                      {selectedOption
                        ? formatInsuranceOptionSummary(selectedOption)
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {contractableOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {formatInsuranceOptionSummary(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOption ? (
                <div className="space-y-1 rounded-lg border p-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Cobertura:</span>{" "}
                    {formatCoveragePercent(selectedOption.coverage_percentage)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Duración:</span>{" "}
                    {selectedOption.duration_days} días
                  </p>
                  <p>
                    <span className="text-muted-foreground">Prima:</span>{" "}
                    {selectedOption.is_free_eligible
                      ? "Gratis (primera contratación)"
                      : formatInsuranceMinorAmount(selectedOption.premium)}
                  </p>
                  {selectedPlan?.requires_approval ? (
                    <p className="text-xs text-muted-foreground">
                      Las reclamaciones de este plan requieren aprobación del
                      equipo de soporte.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          )}

          <p className="text-xs text-muted-foreground">
            La cuenta debe estar activa, sin posiciones abiertas y con saldo
            positivo. La prima se cobra desde tu billetera, salvo promociones
            de primera contratación gratuita.
          </p>
        </div>

        <DialogFooter className="shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={
              submitting ||
              loadingPlans ||
              !account ||
              contractablePlans.length === 0 ||
              !selectedOptionId
            }
          >
            {submitting ? "Contratando..." : "Contratar seguro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
