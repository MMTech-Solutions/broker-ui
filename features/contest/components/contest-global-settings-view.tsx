"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getContestGlobalSettings,
  updateContestGlobalSettings,
} from "@/features/contest/api";
import { parseOptionalInteger } from "@/features/contest/format";
import type { ContestGlobalSettings } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { cn } from "@/lib/utils";

const settingsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Contests", href: "/contests" },
  { label: "Global settings", current: true },
];

type FormState = {
  banner_image_url: string;
  help_html: string;
  start_reminder_days: string;
  closing_alert_days: string;
};

const emptyForm: FormState = {
  banner_image_url: "",
  help_html: "",
  start_reminder_days: "",
  closing_alert_days: "",
};

function settingsToForm(settings: ContestGlobalSettings): FormState {
  return {
    banner_image_url: settings.banner_image_url ?? "",
    help_html: settings.help_html ?? "",
    start_reminder_days:
      settings.start_reminder_days != null
        ? String(settings.start_reminder_days)
        : "",
    closing_alert_days:
      settings.closing_alert_days != null
        ? String(settings.closing_alert_days)
        : "",
  };
}

export function ContestGlobalSettingsView() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getContestGlobalSettings();
      setForm(settingsToForm(response.data));
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSavedMessage(null);

    try {
      const startReminderDays = parseOptionalInteger(form.start_reminder_days);
      const closingAlertDays = parseOptionalInteger(form.closing_alert_days);

      await updateContestGlobalSettings({
        banner_image_url: form.banner_image_url.trim() || null,
        help_html: form.help_html.trim() || null,
        start_reminder_days: startReminderDays ?? null,
        closing_alert_days: closingAlertDays ?? null,
      });

      setSavedMessage("Global settings saved.");
      await loadSettings();
    } catch (saveError) {
      setSubmitError(formatBrokerApiError(saveError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={settingsBreadcrumbs}
        backHref="/contests"
        backLabel="Ir atrás"
      >
        <Button variant="outline" render={<Link href="/contests" />}>
          <ArrowLeftIcon />
          Back to contests
        </Button>
      </PageContentToolbar>

      {error ? (
        <ApiErrorAlert title="Could not load global settings" message={error} />
      ) : null}

      {submitError ? (
        <ApiErrorAlert title="Could not save global settings" message={submitError} />
      ) : null}

      {savedMessage ? (
        <p className="text-sm text-muted-foreground">{savedMessage}</p>
      ) : null}

      {loading ? (
        <div className="space-y-3 rounded-xl border p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <form
          className="max-w-3xl space-y-4 rounded-xl border p-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="contest-banner-url">Banner image URL</Label>
            <Input
              id="contest-banner-url"
              value={form.banner_image_url}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  banner_image_url: event.target.value,
                }))
              }
              disabled={submitting}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contest-help-html">Help HTML</Label>
            <textarea
              id="contest-help-html"
              value={form.help_html}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  help_html: event.target.value,
                }))
              }
              disabled={submitting}
              rows={10}
              className={cn(
                "flex min-h-40 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contest-start-reminder-days">
                Start reminder days
              </Label>
              <Input
                id="contest-start-reminder-days"
                type="number"
                min={0}
                value={form.start_reminder_days}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    start_reminder_days: event.target.value,
                  }))
                }
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contest-closing-alert-days">
                Closing alert days
              </Label>
              <Input
                id="contest-closing-alert-days"
                type="number"
                min={0}
                value={form.closing_alert_days}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    closing_alert_days: event.target.value,
                  }))
                }
                disabled={submitting}
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save settings"}
          </Button>
        </form>
      )}
    </div>
  );
}
