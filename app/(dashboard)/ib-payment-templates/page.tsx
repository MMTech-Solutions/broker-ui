import { SiteHeader } from "@/components/layout/site-header";
import { IbPaymentTemplatesView } from "@/features/ib-payment-template/components/ib-payment-templates-view";

export default function IbPaymentTemplatesPage() {
  return (
    <>
      <SiteHeader
        title="Payment templates"
        description="IB payment templates with commission rates per upline level."
      />
      <IbPaymentTemplatesView />
    </>
  );
}
