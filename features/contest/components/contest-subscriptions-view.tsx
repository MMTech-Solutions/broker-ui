"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BanIcon, ShieldBanIcon } from "lucide-react";

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
import { listContestParticipants, listContests } from "@/features/contest/api";
import { ContestBansDialog } from "@/features/contest/components/contest-bans-dialog";
import { ContestSubscriptionBanDialog } from "@/features/contest/components/contest-subscription-ban-dialog";
import {
  formatContestDateTime,
  formatDecimalValue,
  formatMinorUnits,
  formatPerformanceIndex,
  getContestStatusBadgeVariant,
} from "@/features/contest/format";
import {
  CONTEST_STATUSES,
  type Contest,
  type ContestSubscription,
} from "@/features/contest/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import type { BrokerPaginationMeta } from "@/lib/api/types/broker-response";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

const subscriptionsBreadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Contests", href: "/contests" },
  { label: "Subscriptions", current: true },
];

const ALL_CONTESTS_VALUE = "__none__";

const statusLabels = Object.fromEntries(
  CONTEST_STATUSES.map((option) => [option.value, option.label]),
) as Record<string, string>;

type ContestSubscriptionsViewProps = {
  initialContestId?: string;
};

export function ContestSubscriptionsView({
  initialContestId,
}: ContestSubscriptionsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contestIdFromUrl = searchParams.get("contestId") ?? initialContestId ?? "";

  const [contests, setContests] = useState<Contest[]>([]);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [selectedContestId, setSelectedContestId] = useState(contestIdFromUrl);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  const [subscriptions, setSubscriptions] = useState<ContestSubscription[]>([]);
  const [pagination, setPagination] = useState<BrokerPaginationMeta | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [banOpen, setBanOpen] = useState(false);
  const [subscriptionToBan, setSubscriptionToBan] =
    useState<ContestSubscription | null>(null);

  const [bansOpen, setBansOpen] = useState(false);

  const loadContests = useCallback(async () => {
    setContestsLoading(true);
    setError(null);

    try {
      const response = await listContests({ per_page: 100 });
      setContests(response.data);
    } catch (loadError) {
      setError(formatBrokerApiError(loadError));
      setContests([]);
    } finally {
      setContestsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContests();
  }, [loadContests]);

  useEffect(() => {
    if (contestIdFromUrl) {
      setSelectedContestId(contestIdFromUrl);
      setPage(1);
    }
  }, [contestIdFromUrl]);

  useEffect(() => {
    setSelectedContest(
      contests.find((contest) => contest.id === selectedContestId) ?? null,
    );
  }, [contests, selectedContestId]);

  const loadSubscriptions = useCallback(
    async (contestId: string, requestedPage: number) => {
      if (!contestId) {
        setSubscriptions([]);
        setPagination(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await listContestParticipants(contestId, {
          page: requestedPage,
          per_page: 15,
        });

        setSubscriptions(response.data);
        setPagination(response.meta.pagination ?? null);
      } catch (loadError) {
        setError(formatBrokerApiError(loadError));
        setSubscriptions([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadSubscriptions(selectedContestId, page);
  }, [loadSubscriptions, selectedContestId, page]);

  const contestOptions = useMemo(() => {
    return [...contests].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [contests]);

  function handleContestChange(contestId: string) {
    const nextContestId = contestId === ALL_CONTESTS_VALUE ? "" : contestId;

    setSelectedContestId(nextContestId);
    setPage(1);

    if (nextContestId) {
      router.replace(`/contest-subscriptions?contestId=${nextContestId}`);
      return;
    }

    router.replace("/contest-subscriptions");
  }

  function openBanDialog(subscription: ContestSubscription) {
    setSubscriptionToBan(subscription);
    setBanOpen(true);
  }

  function handleMutationSuccess() {
    void loadContests();
    void loadSubscriptions(selectedContestId, page);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar
        breadcrumbs={subscriptionsBreadcrumbs}
        backHref="/contests"
        backLabel="Ir atrás"
      >
        {selectedContest ? (
          <Button
            variant="outline"
            onClick={() => setBansOpen(true)}
            disabled={contestsLoading}
          >
            <ShieldBanIcon />
            View exclusions
          </Button>
        ) : null}
      </PageContentToolbar>

      <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="contest-subscription-filter">Contest</Label>
          <Select
            value={selectedContestId || ALL_CONTESTS_VALUE}
            onValueChange={(value) =>
              handleContestChange(value ?? ALL_CONTESTS_VALUE)
            }
            disabled={contestsLoading}
          >
            <SelectTrigger id="contest-subscription-filter" className="w-full">
              <SelectValue placeholder="Select a contest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CONTESTS_VALUE}>
                Select a contest
              </SelectItem>
              {contestOptions.map((contest) => (
                <SelectItem key={contest.id} value={contest.id}>
                  {contest.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedContest ? (
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <Badge variant={getContestStatusBadgeVariant(selectedContest.status)}>
              {statusLabels[selectedContest.status] ?? selectedContest.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {selectedContest.subscriptions_count ?? 0} active subscriptions
            </span>
          </div>
        ) : null}
      </div>

      {error ? (
        <ApiErrorAlert title="Could not load subscriptions" message={error} />
      ) : null}

      {!selectedContestId && !contestsLoading ? (
        <div className="rounded-xl border px-4 py-10 text-center text-muted-foreground">
          Select a contest to view its active subscriptions.
        </div>
      ) : null}

      {selectedContestId ? (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Trader ID</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Balance snapshot</TableHead>
                <TableHead>Current equity</TableHead>
                <TableHead>Entry fee</TableHead>
                <TableHead>Subscribed at</TableHead>
                <TableHead className="w-[72px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}

              {!loading && subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No active subscriptions for this contest.
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading
                ? subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.external_user_id}
                      </TableCell>
                      <TableCell>
                        {subscription.account?.external_trader_id ?? "—"}
                      </TableCell>
                      <TableCell>
                        {formatPerformanceIndex(subscription.performance_index)}
                      </TableCell>
                      <TableCell>
                        {formatDecimalValue(subscription.balance_snapshot)}
                      </TableCell>
                      <TableCell>
                        {formatDecimalValue(
                          subscription.account?.current_equity,
                        )}
                      </TableCell>
                      <TableCell>
                        {formatMinorUnits(
                          subscription.entry_fee_charged,
                          selectedContest?.server_group?.currency,
                          selectedContest?.server_group?.currency_precision,
                        )}
                      </TableCell>
                      <TableCell>
                        {formatContestDateTime(subscription.subscribed_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ActionTooltipButton
                          variant="ghost"
                          size="icon-sm"
                          tooltip={`Exclude ${subscription.external_user_id}`}
                          onClick={() => openBanDialog(subscription)}
                        >
                          <BanIcon />
                        </ActionTooltipButton>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {pagination && pagination.last_page > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page} (
            {pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.last_page || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.last_page, current + 1),
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <ContestSubscriptionBanDialog
        contest={selectedContest}
        subscription={subscriptionToBan}
        open={banOpen}
        onOpenChange={setBanOpen}
        onSuccess={handleMutationSuccess}
      />

      <ContestBansDialog
        contest={selectedContest}
        open={bansOpen}
        onOpenChange={setBansOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
