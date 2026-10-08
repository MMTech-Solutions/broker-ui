"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  listAllConfigs,
  updateConfigsBatch,
} from "@/features/configuration/api";
import {
  categoryLabel,
  displayValueForForm,
  groupConfigsByCategory,
  serializeValueForSubmit,
} from "@/features/configuration/format";
import type { BrokerConfig } from "@/features/configuration/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { useFeatureAvailability } from "@/features/feature-availability/components/feature-availability-provider";
import { FEATURE_NAMES, type FeatureName } from "@/features/feature-availability/types";
import { cn } from "@/lib/utils";

const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Configuration", current: true },
];

export function ConfigurationView() {
  const { states, loading: availabilityLoading, error: availabilityError, refresh } = useFeatureAvailability();
  const [configs, setConfigs] = useState<BrokerConfig[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const availableConfigs = useMemo(() => configs.filter((config) => {
    const area = config.schema.area;
    return area === "features" || area === "shared" || (!availabilityLoading && !availabilityError && states[area as FeatureName]);
  }), [configs, states, availabilityLoading, availabilityError]);
  const groups = useMemo(() => groupConfigsByCategory(availableConfigs), [availableConfigs]);
  const selectedCategory = groups.some((group) => group.category === activeCategory) ? activeCategory : (groups.find((group) => group.category === "features")?.category ?? groups[0]?.category ?? null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await listAllConfigs();
        if (cancelled) {
          return;
        }
        setConfigs(data);
        setFormValues(
          Object.fromEntries(
            data.map((config) => [
              config.key,
              displayValueForForm(config),
            ]),
          ),
        );
        setActiveCategory((current) => {
          if (current && data.some((item) => item.category === current)) {
            return current;
          }
          return data.some((item) => item.category === "features")
            ? "features"
            : (data[0]?.category ?? null);
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleConfigs = useMemo(
    () =>
      selectedCategory
        ? availableConfigs.filter((config) => config.category === selectedCategory)
        : [],
    [selectedCategory, availableConfigs],
  );

  function setValue(key: string, value: string) {
    const dependents = FEATURE_NAMES.filter((feature) => feature !== "trading" && formValues["features." + feature + ".enabled"] === "true");
    if (key === "features.trading.enabled" && value === "false" && dependents.length) {
      setSubmitError("Disable these features before Trading: " + dependents.join(", "));
      return;
    }
    if (key.startsWith("features.") && key !== "features.trading.enabled" && value === "true" && formValues["features.trading.enabled"] !== "true") {
      setSubmitError("Enable Trading before enabling another feature.");
      return;
    }
    setSubmitError(null);
    setFormValues((current) => ({ ...current, [key]: value }));
    setSavedMessage(null);
  }

  async function handleSave() {
    if (!selectedCategory) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSavedMessage(null);

    try {
      const payload = visibleConfigs.map((config) => ({
        key: config.key,
        value: serializeValueForSubmit(
          config,
          formValues[config.key] ?? "",
        ),
      }));

      const response = await updateConfigsBatch({ configs: payload });
      setConfigs((current) => {
        const byKey = new Map(response.data.map((item) => [item.key, item]));
        return current.map((item) => byKey.get(item.key) ?? item);
      });
      setFormValues((current) => {
        const next = { ...current };
        for (const item of response.data) {
          next[item.key] = displayValueForForm(item);
        }
        return next;
      });
      await refresh(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("broker:features-changed"));
      }
      setActiveCategory(selectedCategory);
      setSavedMessage(`Saved ${response.data.length} setting(s).`);
    } catch (saveError) {
      setSubmitError(formatBrokerApiError(saveError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <PageContentToolbar breadcrumbs={breadcrumbs} />

      {error ? <ApiErrorAlert message={error} /> : null}
      {availabilityError ? <div role="alert" className="space-y-2"><ApiErrorAlert message={availabilityError} /><Button onClick={() => void refresh()}>Retry availability</Button></div> : null}
      {submitError ? <ApiErrorAlert message={submitError} /> : null}
      {savedMessage ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          {savedMessage}
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full max-w-xl" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <Button
                key={group.category}
                type="button"
                size="sm"
                variant={
                  selectedCategory === group.category ? "default" : "outline"
                }
                onClick={() => {
                  setActiveCategory(group.category);
                  setSavedMessage(null);
                  setSubmitError(null);
                }}
              >
                {categoryLabel(group.category)}
              </Button>
            ))}
          </div>

          <div className="space-y-6">
            {visibleConfigs.map((config) => (
              <ConfigField
                key={config.key}
                config={config}
                value={formValues[config.key] ?? ""}
                onChange={(value) => setValue(config.key, value)}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={submitting || visibleConfigs.length === 0}
              onClick={() => void handleSave()}
            >
              {submitting ? "Saving…" : "Save category"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ConfigField({
  config,
  value,
  onChange,
}: {
  config: BrokerConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = config.schema.label || config.key;
  const description = config.schema.description;
  const help = config.schema.help;
  const placeholder = config.is_secret
    ? "Leave blank to keep current secret"
    : (config.schema.placeholder ?? "");

  return (
    <div className="grid max-w-2xl gap-2">
      <div className="space-y-1">
        <Label htmlFor={config.key}>{label}</Label>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        <p className="text-xs text-muted-foreground/80">{config.key} · Area: {config.schema.area}</p>
      </div>

      {config.schema.type === "bool" ? (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={value === "true"}
            onCheckedChange={(checked) =>
              onChange(checked ? "true" : "false")
            }
          />
          Enabled
        </label>
      ) : null}

      {config.schema.type === "select" ? (
        <Select value={value || undefined} onValueChange={(next) => onChange(next ?? "")}>
          <SelectTrigger id={config.key} className="w-full">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {(config.schema.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {config.schema.type === "text" ? (
        <textarea
          id={config.key}
          className={cn(
            "min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}

      {config.schema.type === "string" ||
      config.schema.type === "integer" ||
      config.schema.type === "number" ||
      config.schema.type === "file" ? (
        <Input
          id={config.key}
          type={
            config.is_secret
              ? "password"
              : config.schema.type === "integer" ||
                  config.schema.type === "number"
                ? "number"
                : "text"
          }
          value={value}
          placeholder={placeholder}
          min={config.schema.min}
          max={config.schema.max}
          step={config.schema.type === "number" ? "any" : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}

      {help ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">{help}</p>
      ) : null}
    </div>
  );
}
