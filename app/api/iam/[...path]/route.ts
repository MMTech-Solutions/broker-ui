import { buildBrokerGatewayHeaders } from "@/lib/api/broker-config";
import { env } from "@/lib/env";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const normalizedBaseUrl = env.iamServiceUrl().replace(/\/+$/, "");
  const targetUrl = `${normalizedBaseUrl}/api/iam/${path.join("/")}${incomingUrl.search}`;
  const headers = new Headers(
    buildBrokerGatewayHeaders({}, { surface: "customer_app" }),
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
