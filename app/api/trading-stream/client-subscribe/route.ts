import { buildBrokerGatewayHeaders } from "@/lib/api/broker-config";
import { resolveBrokerAuthCredentials } from "@/lib/auth/session.server";
import { env } from "@/lib/env";

export async function POST(request: Request): Promise<Response> {
  const auth = await resolveBrokerAuthCredentials("client");
  if (!auth) {
    return Response.json(
      { reason: "unauthenticated" },
      {
        status: 401,
        headers: { "X-Trading-Stream-Auth-Forwarded": "false" },
      },
    );
  }

  const body = await request.text();
  const upstreamUrl = new URL(
    "/api/broker/v1/stream/subscribe",
    env.tradingStreamUrl(),
  );

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: buildBrokerGatewayHeaders(
        { "Content-Type": "application/json" },
        { accessToken: auth.accessToken, userinfo: auth.userinfo },
      ),
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return Response.json(
      { reason: "stream_unreachable" },
      {
        status: 502,
        headers: { "X-Trading-Stream-Auth-Forwarded": "true" },
      },
    );
  }

  const headers = new Headers({
    "X-Trading-Stream-Auth-Forwarded": "true",
    "X-Trading-Stream-Upstream-Status": String(upstream.status),
  });
  const contentType = upstream.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);
  const authenticate = upstream.headers.get("WWW-Authenticate");
  if (authenticate) headers.set("WWW-Authenticate", authenticate);

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers,
  });
}
