import { SiteHeader } from "@/components/layout/site-header";
import { ContestCreateView } from "@/features/contest/components/contest-create-view";

export default function CreateContestPage() {
  return <><SiteHeader title="New contest" description="Create a draft contest and continue its configuration." /><ContestCreateView /></>;
}
