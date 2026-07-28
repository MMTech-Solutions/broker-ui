"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";

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

const BANNER_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

type FormState = {
  help_html: string;
  start_reminder_days: string;
  closing_alert_days: string;
};

const emptyForm: FormState = {
  help_html: "",
  start_reminder_days: "",
  closing_alert_days: "",
};

function settingsToForm(settings: ContestGlobalSettings): FormState {
  return {
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
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerObjectUrl, setBannerObjectUrl] = useState<string | null>(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!bannerFile) {
      setBannerObjectUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(bannerFile);
    setBannerObjectUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [bannerFile]);

  const bannerPreviewUrl = useMemo(() => {
    if (bannerObjectUrl) {
      return bannerObjectUrl;
    }

    if (removeBanner) {
      return null;
    }

    return currentBannerUrl;
  }, [bannerObjectUrl, currentBannerUrl, removeBanner]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getContestGlobalSettings();
      setForm(settingsToForm(response.data));
      setCurrentBannerUrl(response.data.banner_image_url);
      setBannerFile(null);
      setRemoveBanner(false);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function handleBannerChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setBannerFile(file);
    setRemoveBanner(false);
  }

  function handleRemoveBanner() {
    setBannerFile(null);
    setRemoveBanner(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSavedMessage(null);

    try {
      const startReminderDays = parseOptionalInteger(form.start_reminder_days);
      const closingAlertDays = parseOptionalInteger(form.closing_alert_days);

      await updateContestGlobalSettings({
        banner: bannerFile,
        remove_banner: removeBanner && !bannerFile,
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
            <Label htmlFor="contest-banner-file">Banner image</Label>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG or WebP. Uploaded to storage on save; leave empty to keep
              the current banner.
            </p>

            {bannerPreviewUrl ? (
              <div className="overflow-hidden rounded-lg border bg-muted/30">
                <img
                  src={bannerPreviewUrl}
                  alt="Contest banner preview"
                  className="max-h-48 w-full object-contain"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                No banner configured
              </div>
            )}

            <Input
              id="contest-banner-file"
              type="file"
              accept={BANNER_ACCEPT}
              onChange={handleBannerChange}
              disabled={submitting}
            />

            {bannerFile ? (
              <p className="text-xs text-muted-foreground">
                Selected: {bannerFile.name}
              </p>
            ) : null}

            {(currentBannerUrl || bannerFile) && !removeBanner ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveBanner}
                disabled={submitting}
              >
                <Trash2Icon />
                Remove banner
              </Button>
            ) : null}

            {removeBanner ? (
              <p className="text-xs text-muted-foreground">
                Banner will be removed on save.
              </p>
            ) : null}
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
                min={1}
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
                min={1}
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
