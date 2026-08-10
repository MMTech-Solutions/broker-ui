import { SiteHeader } from "@/components/layout/site-header";
import { RejectionTemplatesView } from "@/features/rejection-templates/components/rejection-templates-view";

export default function RejectionTemplatesPage() {
  return (
    <>
      <SiteHeader
        title="Rejection templates"
        description="Reusable rejection copy by area for operators (IB plans, insurance, contests)."
      />
      <RejectionTemplatesView />
    </>
  );
}
