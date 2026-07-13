"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTradingServer,
  listTradingServerConfigSchemas,
  listTradingServerEnvironments,
  updateTradingServer,
} from "@/features/trading-server/api";
import {
  buildEmptyConfig,
  configFromTradingServer,
  getDefaultSchemaId,
  serializeConfigForSubmit,
} from "@/features/trading-server/config-form";
import type {
  TradingServer,
  TradingServerConfigSchema,
  TradingServerEnvironment,
} from "@/features/trading-server/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type TradingServerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  platformId: string;
  tradingServer?: TradingServer | null;
  onSuccess: () => void;
};

export function TradingServerFormDialog({
  open,
  onOpenChange,
  mode,
  platformId,
  tradingServer,
  onSuccess,
}: TradingServerFormDialogProps) {
  const [schemas, setSchemas] = useState<TradingServerConfigSchema[]>([]);
  const [environments, setEnvironments] = useState<TradingServerEnvironment[]>(
    [],
  );
  const [schemaId, setSchemaId] = useState("");
  const [environment, setEnvironment] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSchema = useMemo(
    () => schemas.find((schema) => schema.id === schemaId) ?? null,
    [schemas, schemaId],
  );

  const selectedSchemaLabel = useMemo(() => {
    if (!selectedSchema) {
      return null;
    }

    return `${selectedSchema.slug}${selectedSchema.is_default ? " (default)" : ""}`;
  }, [selectedSchema]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);

      try {
        const [schemasResponse, environmentsResponse] = await Promise.all([
          listTradingServerConfigSchemas(platformId),
          listTradingServerEnvironments(),
        ]);

        if (cancelled) {
          return;
        }

        const nextSchemas = schemasResponse.data;
        const nextEnvironments = environmentsResponse.data;
        const initialSchemaId =
          mode === "edit" && tradingServer
            ? tradingServer.config_schema_id
            : getDefaultSchemaId(nextSchemas);
        const initialSchema =
          nextSchemas.find((schema) => schema.id === initialSchemaId) ??
          nextSchemas[0] ??
          null;

        setSchemas(nextSchemas);
        setEnvironments(nextEnvironments);
        setSchemaId(initialSchema?.id ?? "");
        setEnvironment(
          mode === "edit" && tradingServer
            ? tradingServer.environment
            : (nextEnvironments[0]?.value ?? null),
        );
        setIsActive(
          mode === "edit" && tradingServer ? tradingServer.is_active : true,
        );
        setConfig(
          mode === "edit" && tradingServer && initialSchema
            ? configFromTradingServer(
                tradingServer.config,
                initialSchema.definition.fields,
              )
            : initialSchema
              ? buildEmptyConfig(initialSchema.definition.fields)
              : {},
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open, mode, platformId, tradingServer]);

  useEffect(() => {
    if (!open || mode !== "create" || !selectedSchema) {
      return;
    }

    setConfig((current) => {
      const next = buildEmptyConfig(selectedSchema.definition.fields);

      for (const field of selectedSchema.definition.fields) {
        if (current[field.key] !== undefined) {
          next[field.key] = current[field.key];
        }
      }

      return next;
    });
  }, [open, mode, selectedSchema]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSchema || environment === null) {
      setError("Select a configuration schema and environment.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const serializedConfig = serializeConfigForSubmit(
        config,
        selectedSchema.definition.fields,
        mode,
      );

      if (mode === "create") {
        await createTradingServer({
          platform_id: platformId,
          config_schema_id: schemaId || undefined,
          config: serializedConfig,
          environment,
          is_active: isActive,
        });
      } else if (tradingServer) {
        await updateTradingServer(tradingServer.id, {
          config: serializedConfig,
          environment,
          is_active: isActive,
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create" ? "Create trading server" : "Edit trading server"}
          </DialogTitle>
          <DialogDescription>
            Connection settings are validated against the selected config schema.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
          {error ? (
            <ApiErrorAlert
              title={
                mode === "create"
                  ? "Could not create trading server"
                  : "Could not update trading server"
              }
              message={error}
            />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="trading-server-schema">Config schema</Label>
            <Select
              value={schemaId || null}
              onValueChange={(value) => setSchemaId(value ?? "")}
              disabled={loadingOptions || submitting || mode === "edit"}
            >
              <SelectTrigger id="trading-server-schema" className="w-full">
                <SelectValue
                  placeholder={
                    loadingOptions ? "Loading schemas..." : "Select schema"
                  }
                >
                  {selectedSchemaLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {schemas.map((schema) => (
                  <SelectItem key={schema.id} value={schema.id}>
                    {schema.slug}
                    {schema.is_default ? " (default)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trading-server-environment">Environment</Label>
            <Select
              value={environment !== null ? String(environment) : null}
              onValueChange={(value) =>
                setEnvironment(value ? Number.parseInt(value, 10) : null)
              }
              disabled={loadingOptions || submitting}
            >
              <SelectTrigger id="trading-server-environment" className="w-full">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                {environments.map((item) => (
                  <SelectItem key={item.value} value={String(item.value)}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSchema ? (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">Connection config</p>
              {selectedSchema.definition.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`config-${field.key}`}>
                    {field.key}
                    {field.required ? " *" : ""}
                  </Label>
                  <Input
                    id={`config-${field.key}`}
                    type={field.type === "integer" ? "number" : field.type}
                    value={config[field.key] ?? ""}
                    placeholder={
                      field.secret && mode === "edit"
                        ? "Leave blank to keep current value"
                        : undefined
                    }
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    disabled={submitting}
                    required={mode === "create" && field.required}
                    min={field.min}
                    max={field.max}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <Checkbox
              id="trading-server-is-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
              disabled={submitting}
            />
            <Label htmlFor="trading-server-is-active">Active</Label>
          </div>
          </div>

          <DialogFooter className="mt-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loadingOptions}>
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
