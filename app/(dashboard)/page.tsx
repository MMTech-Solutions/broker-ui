import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <SiteHeader
        title="Dashboard"
        description="Broker administration shell connected to broker-service via BFF."
        breadcrumbs={[{ label: "Dashboard" }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
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
