import { SiteHeader } from "@/components/layout/site-header";
import { ClientContestDetailView } from "@/features/client-contest/components/client-contest-detail-view";

type ClientContestDetailPageProps = {
  params: Promise<{ contestId: string }>;
};

export default async function ClientContestDetailPage({
  params,
}: ClientContestDetailPageProps) {
  const { contestId } = await params;

  return (
    <>
      <SiteHeader
        title="Detalle del concurso"
        description="Información, reglas, premios e inscripción."
      />
      <ClientContestDetailView contestId={contestId} />
    </>
  );
}
