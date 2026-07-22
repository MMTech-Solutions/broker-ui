import type {
  AssignContestAwardInput,
  AssignContestConditionInput,
  Contest,
  ContestAward,
  ContestCondition,
  ContestConditionListFilters,
  ContestFormCatalogServerGroup,
  ContestGlobalSettings,
  ContestListFilters,
  CreateContestAwardInput,
  CreateContestConditionInput,
  CreateContestInput,
  EligibleIntroducingBroker,
  UpdateContestAwardAssignmentInput,
  UpdateContestAwardInput,
  UpdateContestConditionAssignmentInput,
  UpdateContestConditionInput,
  UpdateContestGlobalSettingsInput,
  UpdateContestInput,
  ContestParticipantListFilters,
  ContestSubscription,
  CreateContestBanInput,
  ContestAwardListFilters,
  ContestBan,
  ContestBanListFilters,
} from "@/features/contest/types";
import { listServerGroupsForAdmin, listTradingServersForAdmin } from "@/features/trading-server/api";
import { getServerGroupCurrency } from "@/features/trading-server/format";
import type { ServerGroup } from "@/features/trading-server/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const CONTESTS_PATH = "v1/admin/contests";

let cachedFormCatalog: {
  serverGroups: ContestFormCatalogServerGroup[];
  eligibleIntroducingBrokers: EligibleIntroducingBroker[];
} | null = null;

function toSearchParams(
  filters: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

function resolveServerGroupCurrency(currency: ServerGroup["currency"]): {
  code?: string;
  precision: number;
} {
  const resolved = getServerGroupCurrency(currency);

  return {
    code: currency == null ? undefined : resolved.code,
    precision: resolved.precision,
  };
}

function buildServerGroupLabel(
  serverGroup: ServerGroup,
  tradingServerLabel: string,
): string {
  const currency = resolveServerGroupCurrency(serverGroup.currency);

  return currency.code
    ? `${serverGroup.name} (${tradingServerLabel}, ${currency.code})`
    : `${serverGroup.name} (${tradingServerLabel})`;
}

export async function listContests(
  filters: ContestListFilters = {},
): Promise<BrokerSuccessResponse<Contest[]>> {
  return browserBrokerRequest<Contest[]>(CONTESTS_PATH, {
    searchParams: toSearchParams(filters),
  });
}

export async function getContest(
  contestId: string,
): Promise<BrokerSuccessResponse<Contest>> {
  return browserBrokerRequest<Contest>(`${CONTESTS_PATH}/${contestId}`);
}

export async function createContest(
  input: CreateContestInput,
): Promise<BrokerSuccessResponse<Contest>> {
  return browserBrokerRequest<Contest>(CONTESTS_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateContest(
  contestId: string,
  input: UpdateContestInput,
): Promise<BrokerSuccessResponse<Contest>> {
  return browserBrokerRequest<Contest>(`${CONTESTS_PATH}/${contestId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteContest(
  contestId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${CONTESTS_PATH}/${contestId}`, {
    method: "DELETE",
  });
}

export async function activateContest(
  contestId: string,
): Promise<BrokerSuccessResponse<Contest>> {
  return browserBrokerRequest<Contest>(
    `${CONTESTS_PATH}/${contestId}/activate`,
    { method: "POST" },
  );
}

export async function cancelContest(
  contestId: string,
): Promise<BrokerSuccessResponse<Contest>> {
  return browserBrokerRequest<Contest>(`${CONTESTS_PATH}/${contestId}/cancel`, {
    method: "POST",
  });
}

export async function listContestAwards(
  filters: ContestAwardListFilters = {},
): Promise<BrokerSuccessResponse<ContestAward[]>> {
  return browserBrokerRequest<ContestAward[]>(`${CONTESTS_PATH}/awards`, {
    searchParams: toSearchParams(filters),
  });
}

export async function createContestAward(
  input: CreateContestAwardInput,
): Promise<BrokerSuccessResponse<ContestAward>> {
  return browserBrokerRequest<ContestAward>(`${CONTESTS_PATH}/awards`, {
    method: "POST",
    body: input,
  });
}

export async function updateContestAward(
  awardId: string,
  input: UpdateContestAwardInput,
): Promise<BrokerSuccessResponse<ContestAward>> {
  return browserBrokerRequest<ContestAward>(
    `${CONTESTS_PATH}/awards/${awardId}`,
    { method: "PATCH", body: input },
  );
}

export async function deleteContestAward(
  awardId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(`${CONTESTS_PATH}/awards/${awardId}`, {
    method: "DELETE",
  });
}

export async function listAssignedContestAwards(
  contestId: string,
): Promise<BrokerSuccessResponse<ContestAward[]>> {
  return browserBrokerRequest<ContestAward[]>(
    `${CONTESTS_PATH}/${contestId}/awards`,
  );
}

export async function assignContestAward(
  contestId: string,
  awardId: string,
  input: AssignContestAwardInput,
): Promise<BrokerSuccessResponse<ContestAward>> {
  return browserBrokerRequest<ContestAward>(
    `${CONTESTS_PATH}/${contestId}/awards/${awardId}`,
    { method: "POST", body: input },
  );
}

export async function updateAssignedContestAward(
  contestId: string,
  awardId: string,
  input: UpdateContestAwardAssignmentInput,
): Promise<BrokerSuccessResponse<ContestAward>> {
  return browserBrokerRequest<ContestAward>(
    `${CONTESTS_PATH}/${contestId}/awards/${awardId}`,
    { method: "PATCH", body: input },
  );
}

export async function unassignContestAward(
  contestId: string,
  awardId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${CONTESTS_PATH}/${contestId}/awards/${awardId}`,
    { method: "DELETE" },
  );
}

export async function listContestConditions(
  filters: ContestConditionListFilters = {},
): Promise<BrokerSuccessResponse<ContestCondition[]>> {
  return browserBrokerRequest<ContestCondition[]>(
    `${CONTESTS_PATH}/conditions`,
    { searchParams: toSearchParams(filters) },
  );
}

export async function createContestCondition(
  input: CreateContestConditionInput,
): Promise<BrokerSuccessResponse<ContestCondition>> {
  return browserBrokerRequest<ContestCondition>(`${CONTESTS_PATH}/conditions`, {
    method: "POST",
    body: input,
  });
}

export async function updateContestCondition(
  conditionId: string,
  input: UpdateContestConditionInput,
): Promise<BrokerSuccessResponse<ContestCondition>> {
  return browserBrokerRequest<ContestCondition>(
    `${CONTESTS_PATH}/conditions/${conditionId}`,
    { method: "PATCH", body: input },
  );
}

export async function deleteContestCondition(
  conditionId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${CONTESTS_PATH}/conditions/${conditionId}`,
    { method: "DELETE" },
  );
}

export async function listAssignedContestConditions(
  contestId: string,
): Promise<BrokerSuccessResponse<ContestCondition[]>> {
  return browserBrokerRequest<ContestCondition[]>(
    `${CONTESTS_PATH}/${contestId}/conditions`,
  );
}

export async function assignContestCondition(
  contestId: string,
  conditionId: string,
  input: AssignContestConditionInput = {},
): Promise<BrokerSuccessResponse<ContestCondition>> {
  return browserBrokerRequest<ContestCondition>(
    `${CONTESTS_PATH}/${contestId}/conditions/${conditionId}`,
    { method: "POST", body: input },
  );
}

export async function updateAssignedContestCondition(
  contestId: string,
  conditionId: string,
  input: UpdateContestConditionAssignmentInput,
): Promise<BrokerSuccessResponse<ContestCondition>> {
  return browserBrokerRequest<ContestCondition>(
    `${CONTESTS_PATH}/${contestId}/conditions/${conditionId}`,
    { method: "PATCH", body: input },
  );
}

export async function unassignContestCondition(
  contestId: string,
  conditionId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${CONTESTS_PATH}/${contestId}/conditions/${conditionId}`,
    { method: "DELETE" },
  );
}

export async function listEligibleIntroducingBrokers(): Promise<
  BrokerSuccessResponse<EligibleIntroducingBroker[]>
> {
  return browserBrokerRequest<EligibleIntroducingBroker[]>(
    `${CONTESTS_PATH}/eligible-introducing-brokers`,
  );
}

export async function listContestParticipants(
  contestId: string,
  filters: ContestParticipantListFilters = {},
): Promise<BrokerSuccessResponse<ContestSubscription[]>> {
  return browserBrokerRequest<ContestSubscription[]>(
    `${CONTESTS_PATH}/${contestId}/participants`,
    { searchParams: toSearchParams(filters) },
  );
}

export async function listContestBans(
  contestId: string,
  filters: ContestBanListFilters = {},
): Promise<BrokerSuccessResponse<ContestBan[]>> {
  return browserBrokerRequest<ContestBan[]>(
    `${CONTESTS_PATH}/${contestId}/bans`,
    { searchParams: toSearchParams(filters) },
  );
}

export async function storeContestBan(
  contestId: string,
  input: CreateContestBanInput,
): Promise<BrokerSuccessResponse<ContestBan>> {
  return browserBrokerRequest<ContestBan>(`${CONTESTS_PATH}/${contestId}/bans`, {
    method: "POST",
    body: input,
  });
}

export async function revertContestBan(
  contestId: string,
  banId: string,
): Promise<BrokerSuccessResponse<ContestBan>> {
  return browserBrokerRequest<ContestBan>(
    `${CONTESTS_PATH}/${contestId}/bans/${banId}/revert`,
    { method: "POST" },
  );
}

export async function getContestGlobalSettings(): Promise<
  BrokerSuccessResponse<ContestGlobalSettings>
> {
  return browserBrokerRequest<ContestGlobalSettings>(
    `${CONTESTS_PATH}/global-settings`,
  );
}

export async function updateContestGlobalSettings(
  input: UpdateContestGlobalSettingsInput,
): Promise<BrokerSuccessResponse<ContestGlobalSettings>> {
  const formData = new FormData();

  if (input.banner instanceof File) {
    formData.append("banner", input.banner);
  }

  if (input.remove_banner) {
    formData.append("remove_banner", "1");
  }

  if (input.help_html !== undefined) {
    formData.append("help_html", input.help_html ?? "");
  }

  if (input.start_reminder_days !== undefined) {
    formData.append(
      "start_reminder_days",
      input.start_reminder_days == null
        ? ""
        : String(input.start_reminder_days),
    );
  }

  if (input.closing_alert_days !== undefined) {
    formData.append(
      "closing_alert_days",
      input.closing_alert_days == null
        ? ""
        : String(input.closing_alert_days),
    );
  }

  return browserBrokerRequest<ContestGlobalSettings>(
    `${CONTESTS_PATH}/global-settings`,
    { method: "PATCH", body: formData },
  );
}

export async function loadContestFormCatalog(): Promise<{
  serverGroups: ContestFormCatalogServerGroup[];
  eligibleIntroducingBrokers: EligibleIntroducingBroker[];
}> {
  if (cachedFormCatalog) {
    return cachedFormCatalog;
  }

  const [tradingServersResponse, eligibleIbsResponse] = await Promise.all([
    listTradingServersForAdmin({ is_active: true, per_page: 100 }),
    listEligibleIntroducingBrokers(),
  ]);

  const serverGroupResponses = await Promise.all(
    tradingServersResponse.data.map(async (tradingServer) => {
      const response = await listServerGroupsForAdmin(
        tradingServer.id,
        {
          per_page: 100,
        },
      );

      return {
        tradingServer,
        serverGroups: response.data,
      };
    }),
  );

  const serverGroups = serverGroupResponses.flatMap(
    ({ tradingServer, serverGroups: groups }) =>
      groups.map((serverGroup) => {
        const currency = resolveServerGroupCurrency(serverGroup.currency);

        return {
          id: serverGroup.id,
          name: serverGroup.name,
          tradingServerId: tradingServer.id,
          tradingServerLabel: tradingServer.connection_signature,
          currency: currency.code,
          currency_precision: currency.precision,
          label: buildServerGroupLabel(
            serverGroup,
            tradingServer.connection_signature,
          ),
        };
      }),
  );

  cachedFormCatalog = {
    serverGroups,
    eligibleIntroducingBrokers: eligibleIbsResponse.data,
  };

  return cachedFormCatalog;
}

export function invalidateContestFormCatalog(): void {
  cachedFormCatalog = null;
}
