"use client";

import { useEffect, useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicContestGlobalSettings } from "@/features/client-contest/api";
import type { ContestGlobalSettings } from "@/features/client-contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type ClientContestHelpCardProps = {
  compact?: boolean;
};

export function ClientContestHelpCard({ compact = false }: ClientContestHelpCardProps) {
  const [settings, setSettings] = useState<ContestGlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await getPublicContestGlobalSettings();
        if (!cancelled) {
          setSettings(response.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card className={compact ? undefined : "max-w-3xl"}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ApiErrorAlert message={error} />;
  }

  const hasBanner = Boolean(settings?.banner_image_url);
  const hasHelp = Boolean(settings?.help_html?.trim());

  return (
    <Card className={compact ? undefined : "max-w-3xl"}>
      <CardHeader>
        <CardTitle>Información de concursos</CardTitle>
        <CardDescription>
          Contenido publicado por el broker para participantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings?.banner_image_url ?? ""}
            alt="Banner de concursos"
            className="max-h-40 w-full rounded-lg border object-cover"
          />
        ) : null}
        {hasHelp ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: settings?.help_html ?? "" }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay contenido de ayuda configurado todavía.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
