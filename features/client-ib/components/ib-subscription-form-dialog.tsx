"use client";
/* eslint-disable react-hooks/set-state-in-effect */

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
import { getIbPlanSubscriptionForm } from "@/features/client-ib/api";
import type {
  IbSubscriptionFormInput,
  IbSubscriptionFormRuntime,
} from "@/features/client-ib/types";
import type { JwfNode } from "@/features/forms/types";
import { BrokerApiError, formatBrokerApiError } from "@/lib/api/errors";

type Props = {
  planId: string;
  planName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: IbSubscriptionFormInput) => Promise<void>;
};

function inputNodes(node: JwfNode): JwfNode[] {
  return [
    ...(node.kind === "input" ? [node] : []),
    ...(node.children ?? []).flatMap(inputNodes),
  ];
}

function findForm(node: JwfNode): JwfNode | undefined {
  if (node.kind === "form") return node;
  for (const child of node.children ?? []) {
    const found = findForm(child);
    if (found) return found;
  }
  return undefined;
}

function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof BrokerApiError)) return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(error.details)) {
    if (!key.startsWith("form_submission.values.")) continue;
    const name = key.slice("form_submission.values.".length);
    result[name] = Array.isArray(value) ? value.join(" ") : String(value);
  }
  return result;
}

function RuntimeNode({ node, errors }: { node: JwfNode; errors: Record<string, string> }) {
  if (node.kind === "container") {
    return (
      <div className="grid min-w-0 gap-4 rounded-lg border p-4 sm:grid-cols-2">
        {(node.children ?? []).map((child) => (
          <RuntimeNode key={child.id} node={child} errors={errors} />
        ))}
      </div>
    );
  }
  if (node.kind !== "input" || !node.type || !node.name) return null;

  const required = node.attributes.required === true;
  const placeholder = typeof node.attributes.placeholder === "string" ? node.attributes.placeholder : undefined;
  const common = { id: node.id, name: node.name, required, placeholder };
  const error = errors[node.name];

  return (
    <div className={node.type === "textarea" || node.type === "radio" ? "min-w-0 space-y-2 sm:col-span-2" : "min-w-0 space-y-2"}>
      {node.type !== "hidden" ? <Label htmlFor={node.id}>{node.label || node.name}{required ? " *" : ""}</Label> : null}
      {node.description ? <p className="text-xs text-muted-foreground">{node.description}</p> : null}
      {node.type === "textarea" ? (
        <textarea {...common} className="min-h-24 w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />
      ) : node.type === "select" ? (
        <select {...common} defaultValue="" className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
          <option value="" disabled>Select an option</option>
          {(node.options ?? []).map((option) => <option key={option.id} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>
      ) : node.type === "radio" ? (
        <div className="space-y-2">{(node.options ?? []).map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <input type="radio" name={node.name} value={option.value} required={required} disabled={option.disabled} />{option.label}
          </label>
        ))}</div>
      ) : node.type === "checkbox" ? (
        <input {...common} type="checkbox" className="size-4" />
      ) : (
        <input {...common} type={node.type} className={node.type === "hidden" ? "hidden" : "h-9 w-full rounded-lg border bg-transparent px-3 text-sm"} />
      )}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function IbSubscriptionFormDialog({ planId, planName, open, onOpenChange, onSubmit }: Props) {
  const [runtime, setRuntime] = useState<IbSubscriptionFormRuntime | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formId = `ib-subscription-form-${planId}`;

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError(null); setErrors({}); setRuntime(null);
    void getIbPlanSubscriptionForm(planId)
      .then((response) => setRuntime(response.data))
      .catch((loadError) => setError(formatBrokerApiError(loadError)))
      .finally(() => setLoading(false));
  }, [open, planId]);

  const form = runtime ? findForm(runtime.document.root) : undefined;
  const inputs = useMemo(() => form ? inputNodes(form) : [], [form]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!runtime) return;
    setSubmitting(true); setError(null); setErrors({});
    const data = new FormData(event.currentTarget);
    const values: Record<string, string | number | boolean | null> = {};
    for (const input of inputs) {
      if (!input.name) continue;
      if (input.type === "checkbox") {
        values[input.name] = data.has(input.name);
      } else {
        const value = data.get(input.name)?.toString() ?? "";
        values[input.name] = input.type === "number" && value !== "" ? Number(value) : value;
      }
    }
    try {
      await onSubmit({ form_version_id: runtime.form_version_id, form_id: runtime.form_id, values });
      onOpenChange(false);
    } catch (submitError) {
      setErrors(fieldErrors(submitError));
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="flex max-h-[90vh] min-h-0 min-w-0 flex-col overflow-hidden sm:max-w-2xl">
      <DialogHeader><DialogTitle>Formulario de suscripción</DialogTitle><DialogDescription>Completa los requisitos para solicitar {planName}.</DialogDescription></DialogHeader>
      {error ? <ApiErrorAlert title="No se pudo procesar el formulario" message={error} /> : null}
      {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Cargando formulario...</p> : null}
      {runtime && form ? (
        <>
          <form
            id={formId}
            className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-2"
            onSubmit={handleSubmit}
          >
            {(form.children ?? []).map((node) => (
              <RuntimeNode key={node.id} node={node} errors={errors} />
            ))}
          </form>
          <DialogFooter className="shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" form={formId} disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar y suscribirme"}
            </Button>
          </DialogFooter>
        </>
      ) : null}
    </DialogContent>
  </Dialog>;
}
