import type {
  RunScheduledCommandInput,
  ScheduledCommand,
  ScheduledCommandDetail,
  ScheduledCommandListFilters,
  ScheduledCommandRun,
  UpdateScheduledCommandInput,
} from "@/features/scheduling/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const SCHEDULED_COMMANDS_PATH = "v1/admin/scheduled-commands";

function buildListSearchParams(
  filters: ScheduledCommandListFilters,
): Record<string, string | number | boolean> {
  const searchParams: Record<string, string | number | boolean> = {};

  if (filters.signature?.trim()) {
    searchParams.signature = filters.signature.trim();
  }

  if (filters.feature_area) {
    searchParams.feature_area = filters.feature_area;
  }

  if (filters.is_automatic !== undefined) {
    searchParams.is_automatic = filters.is_automatic;
  }

  if (filters.page !== undefined) {
    searchParams.page = filters.page;
  }

  if (filters.per_page !== undefined) {
    searchParams.per_page = filters.per_page;
  }

  return searchParams;
}

export async function listScheduledCommands(
  filters: ScheduledCommandListFilters = {},
): Promise<BrokerSuccessResponse<ScheduledCommand[]>> {
  return browserBrokerRequest<ScheduledCommand[]>(SCHEDULED_COMMANDS_PATH, {
    searchParams: buildListSearchParams(filters),
  });
}

export async function getScheduledCommand(
  scheduledCommandId: string,
): Promise<BrokerSuccessResponse<ScheduledCommandDetail>> {
  return browserBrokerRequest<ScheduledCommandDetail>(
    `${SCHEDULED_COMMANDS_PATH}/${scheduledCommandId}`,
  );
}

export async function updateScheduledCommand(
  scheduledCommandId: string,
  input: UpdateScheduledCommandInput,
): Promise<BrokerSuccessResponse<ScheduledCommand>> {
  return browserBrokerRequest<ScheduledCommand>(
    `${SCHEDULED_COMMANDS_PATH}/${scheduledCommandId}`,
    {
      method: "PATCH",
      body: input,
    },
  );
}

export async function runScheduledCommand(
  scheduledCommandId: string,
  input: RunScheduledCommandInput = {},
): Promise<BrokerSuccessResponse<ScheduledCommandRun>> {
  return browserBrokerRequest<ScheduledCommandRun>(
    `${SCHEDULED_COMMANDS_PATH}/${scheduledCommandId}/run`,
    {
      method: "POST",
      body: input,
    },
  );
}

export async function cancelScheduledCommandRun(
  scheduledCommandId: string,
  runId: string,
): Promise<BrokerSuccessResponse<ScheduledCommandRun>> {
  return browserBrokerRequest<ScheduledCommandRun>(
    `${SCHEDULED_COMMANDS_PATH}/${scheduledCommandId}/runs/${runId}/cancel`,
    {
      method: "POST",
    },
  );
}
