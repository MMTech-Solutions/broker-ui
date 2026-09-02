import { SiteHeader } from "@/components/layout/site-header";
import { SymbolCategoriesView } from "@/features/symbol-category/components/symbol-categories-view";

export default function SymbolCategoriesPage() {
  return (
    <>
      <SiteHeader
        title="Symbol categories"
        description="Global categories assigned explicitly to trading symbols."
      />
      <SymbolCategoriesView />
    </>
  );
}
