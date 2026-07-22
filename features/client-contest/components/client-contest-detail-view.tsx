"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LogInIcon, LogOutIcon, TrophyIcon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  getContestLeaderboardTop,
  getPublicContest,
  listContestLeaderboard,
  listPublicContestConditions,
  unsubscribeFromContest,
} from "@/features/client-contest/api";
import { ClientContestSubscribeDialog } from "@/features/client-contest/components/client-contest-subscribe-dialog";
import type {
  Contest,
  ContestAward,
  ContestCondition,
  ContestSubscription,
} from "@/features/client-contest/types";
import {
  formatContestDateRange,
  formatDecimalValue,
  formatMinorUnits,
  formatPerformanceIndex,
  getContestStatusBadgeVariant,
} from "@/features/contest/format";
import { CONTEST_AWARD_TYPES } from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const awardTypeLabels = Object.fromEntries(
  CONTEST_AWARD_TYPES.map((option) => [option.value, option.label]),
);

const statusLabelsEs = {
  draft: "Borrador",
  upcoming: "Próximo",
  active: "Activo",
  finished: "Finalizado",
  cancelled: "Cancelado",
} as const;

type ClientContestDetailViewProps = {
  contestId: string;
};

function sortAwards(awards: ContestAward[]) {
  return [...awards].sort((left, right) => {
    const leftPosition = left.position ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = right.position ?? Number.MAX_SAFE_INTEGER;

    return leftPosition - rightPosition;
  });
}

function sortConditions(conditions: ContestCondition[]) {
  return [...conditions].sort((left, right) => {
    const leftOrder = left.sort_order ?? 0;
    const rightOrder = right.sort_order ?? 0;

    return leftOrder - rightOrder;
  });
}

export function ClientContestDetailView({ contestId }: ClientContestDetailViewProps) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [conditions, setConditions] = useState<ContestCondition[]>([]);
  const [leaderboard, setLeaderboard] = useState<ContestSubscription[]>([]);
  const [nonRankedLeaderboard, setNonRankedLeaderboard] = useState<
    ContestSubscription[]
  >([]);
  const [topLeaderboard, setTopLeaderboard] = useState<ContestSubscription[]>([]);
  const [showNonRanked, setShowNonRanked] = useState(false);
  const [activeSubscription, setActiveSubscription] =
    useState<ContestSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);

  const canSubscribe = useMemo(
    () =>
      contest?.status === "upcoming" || contest?.status === "active",
    [contest?.status],
  );

  const loadContest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [contestResponse, conditionsResponse] = await Promise.all([
        getPublicContest(contestId),
        listPublicContestConditions(contestId),
      ]);

      setContest(contestResponse.data);
      setConditions(conditionsResponse.data);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setContest(null);
      setConditions([]);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);

    try {
      const [leaderboardResponse, topResponse] = await Promise.all([
        listContestLeaderboard(contestId, {
          per_page: 20,
          include_non_ranked: true,
        }),
        getContestLeaderboardTop(contestId),
      ]);

      setLeaderboard(leaderboardResponse.data);
      setNonRankedLeaderboard(
        leaderboardResponse.meta.non_ranked?.data ?? [],
      );
      setTopLeaderboard(topResponse.data);
    } catch {
      setLeaderboard([]);
      setNonRankedLeaderboard([]);
      setTopLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, [contestId]);

  useEffect(() => {
    void loadContest();
  }, [loadContest]);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  async function handleUnsubscribe() {
    setUnsubscribing(true);
    setActionError(null);

    try {
      await unsubscribeFromContest(contestId);
      setActiveSubscription(null);
      await loadLeaderboard();
    } catch (unsubscribeError) {
      setActionError(formatBrokerApiError(unsubscribeError));
    } finally {
      setUnsubscribing(false);
    }
  }

  function handleSubscribed(subscription: ContestSubscription) {
    setActiveSubscription(subscription);
    setActionError(null);
    void loadLeaderboard();
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PageContentToolbar
          breadcrumbs={[
            { label: "Inicio", href: "/client" },
            { label: "Concursos", href: "/client/contests" },
            { label: "Detalle", current: true },
          ]}
          backHref="/client/contests"
        />
        <ApiErrorAlert message={error ?? "Concurso no encontrado."} />
      </div>
    );
  }

  const awards = sortAwards(contest.awards ?? []);
  const visibleConditions = sortConditions(
    conditions.filter((condition) => condition.is_visible !== false),
  );
  const displayedLeaderboard = showNonRanked
    ? nonRankedLeaderboard
    : leaderboard;

  const detailBreadcrumbs: BreadcrumbItem[] = [
    { label: "Inicio", href: "/client" },
    { label: "Concursos", href: "/client/contests" },
    { label: contest.name, current: true },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={detailBreadcrumbs}
        backHref="/client/contests"
      />

      {actionError ? <ApiErrorAlert message={actionError} /> : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{contest.name}</CardTitle>
            <CardDescription>
              {formatContestDateRange(contest.starts_at, contest.ends_at)}
            </CardDescription>
          </div>
          <Badge variant={getContestStatusBadgeVariant(contest.status)}>
            {statusLabelsEs[contest.status]}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Grupo de servidor</p>
            <p className="text-sm font-medium">
              {contest.server_group?.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cuota de entrada</p>
            <p className="text-sm font-medium">
              {formatMinorUnits(
                contest.entry_fee,
                contest.server_group?.currency,
                contest.server_group?.currency_precision,
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance mínimo</p>
            <p className="text-sm font-medium">
              {formatMinorUnits(
                contest.min_balance_threshold,
                contest.server_group?.currency,
                contest.server_group?.currency_precision,
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance máximo</p>
            <p className="text-sm font-medium">
              {formatMinorUnits(
                contest.max_balance_threshold,
                contest.server_group?.currency,
                contest.server_group?.currency_precision,
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {canSubscribe ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tu participación</CardTitle>
            <CardDescription>
              Inscríbete con una cuenta elegible o cancela tu inscripción activa.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {activeSubscription ? (
              <p className="w-full text-sm text-muted-foreground">
                Inscrito con la cuenta{" "}
                <span className="font-medium text-foreground">
                  {activeSubscription.account?.external_trader_id ??
                    activeSubscription.account_id}
                </span>
                {activeSubscription.subscribed_at
                  ? ` desde ${new Date(activeSubscription.subscribed_at).toLocaleString()}`
                  : null}
                .
              </p>
            ) : null}
            <Button onClick={() => setSubscribeOpen(true)}>
              <LogInIcon />
              Inscribirse
            </Button>
            <Button
              variant="outline"
              disabled={unsubscribing}
              onClick={() => void handleUnsubscribe()}
            >
              <LogOutIcon />
              {unsubscribing ? "Cancelando…" : "Cancelar inscripción"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Premios</CardTitle>
            <CardDescription>
              Recompensas asignadas a este concurso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {awards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin premios publicados.
              </p>
            ) : (
              <ul className="space-y-3">
                {awards.map((award) => (
                  <li
                    key={award.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{award.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {awardTypeLabels[award.award_type] ?? award.award_type}
                      </p>
                    </div>
                    {award.position ? (
                      <Badge variant="outline">#{award.position}</Badge>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reglas</CardTitle>
            <CardDescription>
              Condiciones visibles para participantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {visibleConditions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin reglas publicadas.
              </p>
            ) : (
              <ul className="space-y-3">
                {visibleConditions.map((condition) => (
                  <li key={condition.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{condition.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                      {condition.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Ranking</CardTitle>
            <CardDescription>
              Clasificación del concurso y top participantes.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={showNonRanked ? "secondary" : "outline"}
              aria-pressed={showNonRanked}
              onClick={() => setShowNonRanked((current) => !current)}
            >
              No clasificados
            </Button>
            <TrophyIcon className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {leaderboardLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              {!showNonRanked && topLeaderboard.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Top</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {topLeaderboard.slice(0, 3).map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg border bg-muted/30 p-3"
                      >
                        <p className="text-xs text-muted-foreground">
                          Puesto {entry.rank ?? "—"}
                        </p>
                        <p className="text-sm font-medium">
                          {entry.account?.external_trader_id ?? entry.account_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ROI {formatPerformanceIndex(entry.performance_index)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>ROI</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedLeaderboard.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-8 text-center text-sm text-muted-foreground"
                        >
                          {showNonRanked
                            ? "No hay participantes no clasificados."
                            : "Aún no hay participantes en el ranking."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedLeaderboard.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {showNonRanked ? "—" : (entry.rank ?? "—")}
                          </TableCell>
                          <TableCell>
                            {entry.account?.external_trader_id ?? entry.account_id}
                          </TableCell>
                          <TableCell>
                            {formatPerformanceIndex(entry.performance_index)}
                          </TableCell>
                          <TableCell>
                            {formatDecimalValue(entry.balance_snapshot)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ClientContestSubscribeDialog
        contest={contest}
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
        onSubscribed={handleSubscribed}
      />
    </div>
  );
}
