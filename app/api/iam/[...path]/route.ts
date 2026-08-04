import { buildBrokerGatewayHeaders } from "@/lib/api/broker-config";
import { resolveBrokerAuthCredentials } from "@/lib/auth/session.server";
import { env } from "@/lib/env";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function buildIamUpstreamUrl(pathSegments: string[], search: string): string {
  const apiBase = env.iamApiBase();

  if (!apiBase) {
    throw new Error(
      "IAM_API_BASE (or AUTH_SERVICE_URL) is not configured. Example: http://localhost:8000/api/iam/v1",
    );
  }

  // Browser paths are `v1/...`; IAM_API_BASE already ends at `/api/iam/v1`.
  const relative = pathSegments.join("/").replace(/^v1\//, "");

  return `${apiBase.replace(/\/+$/, "")}/${relative}${search}`;
}

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = buildIamUpstreamUrl(path, incomingUrl.search);
  const auth = await resolveBrokerAuthCredentials("client");
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

  const requestBody =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();
  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      requestBody && requestBody.byteLength > 0 ? requestBody : undefined,
    cache: "no-store",
  });
  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("Content-Type");

  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  return new Response(upstream.status === 204 ? null : await upstream.text(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
