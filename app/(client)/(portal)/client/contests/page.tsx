'server-only'
import { SiteHeader } from "@/components/layout/site-header";
import { ClientContestsView } from "@/features/client-contest";
import { getContestBannerUrl } from "@/features/client-contest/api";
import { BrokerApiError } from "@/lib/api/errors";

export default async function ClientContestsPage() {
  let bannerUrl = null;
  const response = (await getContestBannerUrl()).data as {slides: {image_url: string}[]};
  if(response.slides.length > 0) {
    bannerUrl = response.slides[0].image_url;
  }
  return (
    <>
      <SiteHeader
        title="Concursos"
        description="Concursos disponibles para participar."
      />
      <ClientContestsView bannerUrl={bannerUrl} />
    </>
  );
}
