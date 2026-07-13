import { BrokerApiError } from "@/lib/api/errors";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import { isBrokerSuccessResponse } from "@/lib/api/types/broker-response";

const BFF_BASE_PATH = "/api/broker";

type BrowserBrokerRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  searchParams?: URLSearchParams | Record<string, string | number | boolean>;
};

function serializeSearchParamValue(value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return String(value);
}

function buildSearch(searchParams?: BrowserBrokerRequestOptions["searchParams"]) {
  if (!searchParams) {
    return "";
  }

  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(
          Object.entries(searchParams)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [
              key,
              serializeSearchParamValue(value as string | number | boolean),
            ]),
        );

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function browserBrokerRequest<T>(
  path: string,
  options: BrowserBrokerRequestOptions = {},
): Promise<BrokerSuccessResponse<T>> {
  const normalizedPath = path.replace(/^\/+/, "");
  const search = buildSearch(options.searchParams);
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  let body: string | undefined;

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(
    `${BFF_BASE_PATH}/${normalizedPath}${search}`,
    {
      method: options.method ?? "GET",
      headers,
      body,
      cache: "no-store",
    },
  );

  if (response.status === 204) {
    return {
      success: true,
      data: undefined as T,
      meta: { message: "No Content" },
    };
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw BrokerApiError.fromResponse(
      response.status,
      null,
      "Broker API returned an invalid response.",
    );
  }

  if (!response.ok || !isBrokerSuccessResponse<T>(payload)) {
    throw BrokerApiError.fromResponse(response.status, payload);
  }

  return payload;
}
