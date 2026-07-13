import { SiteHeader } from "@/components/layout/site-header";
import { TradingAccountsView } from "@/features/trading-account/components/trading-accounts-view";

export default function TradingAccountsPage() {
  return (
    <>
      <SiteHeader
        title="Trading accounts"
        description="Read-only list of trading accounts with filters."
      />
      <TradingAccountsView />
    </>
  );
}
