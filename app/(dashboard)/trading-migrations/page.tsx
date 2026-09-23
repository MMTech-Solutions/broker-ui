import { SiteHeader } from "@/components/layout/site-header";
import { TradingMigrationsView } from "@/features/trading-migration/components/trading-migrations-view";

export default function TradingMigrationsPage() {
  return <><SiteHeader title="Trading migrations" description="Migrate pending trading accounts to Risk and audit every run." /><TradingMigrationsView /></>;
}
