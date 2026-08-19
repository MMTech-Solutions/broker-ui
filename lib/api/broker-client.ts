import "server-only";

import {
  buildBrokerApiUrl,
  buildBrokerGatewayHeaders,
  rbacSurfaceToAuthArea,
} from "@/lib/api/broker-config";
import { BrokerApiError } from "@/lib/api/errors";
import { resolveRbacSurfaceFromApiPath } from "@/lib/api/rbac-surface";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import { isBrokerSuccessResponse } from "@/lib/api/types/broker-response";
import { resolveBrokerAuthCredentials } from "@/lib/auth/session.server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type BrokerRequestOptions = {
  method?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
  search?: string;
  withoutAuth?: boolean;
};

export async function brokerRequest<T>(
  path: string,
  options: BrokerRequestOptions = {},
): Promise<BrokerSuccessResponse<T>> {
  const method = options.method ?? "GET";
  const surface = resolveRbacSurfaceFromApiPath(path);
  const auth =
    surface === null || options.withoutAuth
      ? null
      : await resolveBrokerAuthCredentials(rbacSurfaceToAuthArea(surface));

  if (surface !== null && !auth) {
    throw BrokerApiError.fromResponse(
      401,
      { success: false, meta: { message: "Unauthenticated." } },
      "Unauthenticated.",
    );
  }

  const headers = new Headers(
    buildBrokerGatewayHeaders(
      {},
      auth
        ? { accessToken: auth.accessToken, userinfo: auth.userinfo }
        : {},
    ),
  );
  const incomingHeaders = new Headers(options.headers);

  incomingHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildBrokerApiUrl(path, options.search ?? ""), {
    method,
    headers,
    body: options.body,
    cache: "no-store",
  });
console.log(response, headers);
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

export async function proxyBrokerRequest(
  request: Request,
  pathSegments: string[],
): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const targetPath = pathSegments.join("/");
  const surface = resolveRbacSurfaceFromApiPath(targetPath);
  const auth =
    surface === null
      ? null
      : await resolveBrokerAuthCredentials(rbacSurfaceToAuthArea(surface));

  if (surface !== null && !auth) {
    return Response.json(
      { success: false, meta: { message: "Unauthenticated." } },
      { status: 401 },
    );
  }

  const headers = new Headers(
    buildBrokerGatewayHeaders(
      {},
      auth
        ? { accessToken: auth.accessToken, userinfo: auth.userinfo }
        : {},
    ),
  );

  const contentType = request.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  // Use arrayBuffer so multipart uploads (and any binary body) are not corrupted.
  const body = MUTATING_METHODS.has(request.method)
    ? await request.arrayBuffer()
    : undefined;

  const upstream = await fetch(
    buildBrokerApiUrl(targetPath, incomingUrl.search),
    {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    },
  );

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("Content-Type");

  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  if (upstream.status === 204) {
    return new Response(null, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  // arrayBuffer preserves binary bodies (e.g. platform images); also fine for JSON.
  const responseBody = await upstream.arrayBuffer();

  return new Response(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
