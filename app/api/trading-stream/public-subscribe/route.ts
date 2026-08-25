import { env } from "@/lib/env";

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const upstreamUrl = new URL(
    "/api/broker/v1/internal/risk-metrics/shares/stream/authorize",
    env.brokerServiceUrl(),
  );

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return Response.json({ reason: "stream_unreachable" }, { status: 502 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers,
  });
}
