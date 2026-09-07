import Link from "next/link";

import { BrokerRequestCredentials } from "@/components/auth/broker-request-credentials";
import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jwtPayloadSegment } from "@/lib/auth/jwt";
import { readSession } from "@/lib/auth/session.server";

export default async function DashboardPage() {
  const session = await readSession("admin");
  const accessToken = session?.access_token ?? null;

  return (
    <>
      <SiteHeader
        title="Dashboard"
        description="Broker administration shell connected to broker-service via BFF."
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <PageContentToolbar breadcrumbs={[{ label: "Dashboard", current: true }]}>
          <BrokerRequestCredentials
            accessToken={accessToken}
            userinfo={accessToken ? jwtPayloadSegment(accessToken) : null}
          />
        </PageContentToolbar>
        <Card>
          <CardHeader>
            <CardTitle>Broker UI foundation</CardTitle>
            <CardDescription>
              Next.js App Router with shadcn/ui and a server-side BFF proxy for
              broker-service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Platform endpoints are scaffolded under{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                features/platform
              </code>{" "}
              and will be wired in the next step.
            </p>
            <Button render={<Link href="/platforms" />}>Go to Platforms</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
