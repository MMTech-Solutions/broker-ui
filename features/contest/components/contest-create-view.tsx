"use client";

import { PageContentToolbar } from "@/components/layout/page-content-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContestGeneralForm } from "@/features/contest/components/contest-general-form";

export function ContestCreateView() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageContentToolbar breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Contests", href: "/contests" }, { label: "New contest", current: true }]} backHref="/contests" backLabel="Back to contests" />
      <div className="grid gap-4 xl:grid-cols-12">
        <main className="xl:col-span-9"><ContestGeneralForm mode="create" /></main>
        <aside className="xl:col-span-3"><Card><CardHeader><CardTitle>Draft workflow</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>Complete the required general configuration to create the contest in draft.</p><p>After creation you will enter its workspace to configure awards, rules, exclusions and subscriptions.</p></CardContent></Card></aside>
      </div>
    </div>
  );
}
