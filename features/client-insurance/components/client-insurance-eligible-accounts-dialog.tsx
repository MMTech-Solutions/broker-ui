"use client";

import { useEffect, useState } from "react";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loadClientInsuranceEligibleAccounts } from "@/features/client-insurance/api";
import { formatAccountBalance } from "@/features/client-insurance/format";
import type { ClientInsuranceEligibleAccount } from "@/features/client-insurance/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientInsuranceEligibleAccountsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environmentByAccountId?: Map<string, number | null>;
  onSelectAccount: (account: ClientInsuranceEligibleAccount) => void;
};

export function ClientInsuranceEligibleAccountsDialog({
  open,
  onOpenChange,
  environmentByAccountId,
  onSelectAccount,
}: ClientInsuranceEligibleAccountsDialogProps) {
  const [accounts, setAccounts] = useState<ClientInsuranceEligibleAccount[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadAccounts() {
      setLoading(true);
      setError(null);

      try {
        const eligibleAccounts = await loadClientInsuranceEligibleAccounts({
          environmentByAccountId,
        });

        if (!cancelled) {
          setAccounts(eligibleAccounts);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
          setAccounts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [environmentByAccountId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Cuentas elegibles para seguro</DialogTitle>
          <DialogDescription>
            Solo aparecen cuentas live activas, con saldo positivo, sin
            posiciones abiertas y con planes disponibles para tu saldo actual.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          {error ? (
            <ApiErrorAlert
              title="No se pudieron cargar las cuentas elegibles"
              message={error}
            />
          ) : null}

          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes cuentas elegibles para contratar un seguro en este
              momento. Revisa que tengas una cuenta live activa, sin operaciones
              abiertas, con saldo dentro de los límites del plan y sin un
              seguro en curso.
            </p>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Login</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Planes</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Acción
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.external_trader_id}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatAccountBalance(account.current_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {account.plans.length}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            onSelectAccount(account);
                            onOpenChange(false);
                          }}
                        >
                          Asegurar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
