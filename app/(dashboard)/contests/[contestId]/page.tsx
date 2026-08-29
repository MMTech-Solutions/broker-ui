import { SiteHeader } from "@/components/layout/site-header";
import { ContestWorkspaceView, type ContestWorkspaceTab } from "@/features/contest/components/contest-workspace-view";

const tabs: ContestWorkspaceTab[] = ["general", "bans", "awards", "conditions", "subscriptions"];

export default async function ContestWorkspacePage({ params, searchParams }: { params: Promise<{ contestId: string }>; searchParams: Promise<{ tab?: string }> }) {
  const [{ contestId }, query] = await Promise.all([params, searchParams]);
  const activeTab = tabs.includes(query.tab as ContestWorkspaceTab) ? query.tab as ContestWorkspaceTab : "general";

  return <><SiteHeader title="Contest workspace" description="Configuration, lifecycle and participation management." /><ContestWorkspaceView contestId={contestId} activeTab={activeTab} /></>;
}
