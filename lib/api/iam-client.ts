"use client";

import { BrokerApiError } from "@/lib/api/errors";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import { isBrokerSuccessResponse } from "@/lib/api/types/broker-response";

type BrowserIamRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
};

export async function browserIamRequest<T>(
  path: string,
  options: BrowserIamRequestOptions = {},
): Promise<BrokerSuccessResponse<T>> {
  const normalizedPath = path.replace(/^\/+/, "");
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`/api/iam/${normalizedPath}`, {
    method: options.method ?? "GET",
    headers,
    body,
    cache: "no-store",
  });

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw BrokerApiError.fromResponse(
      response.status,
      null,
      "IAM API returned an invalid response.",
    );
  }

  if (!response.ok || !isBrokerSuccessResponse<T>(payload)) {
    throw BrokerApiError.fromResponse(response.status, payload);
  }

  return payload;
}
