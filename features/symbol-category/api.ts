import type {
  CreateSymbolCategoryInput,
  SymbolCategory,
  SymbolCategoryListFilters,
  UpdateSymbolCategoryInput,
} from "@/features/symbol-category/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";

const SYMBOL_CATEGORIES_ADMIN_PATH = "v1/admin/symbol-categories";

function compactFilters(filters: SymbolCategoryListFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, string | number>;
}

export async function listSymbolCategories(
  filters: SymbolCategoryListFilters = {},
): Promise<BrokerSuccessResponse<SymbolCategory[]>> {
  return browserBrokerRequest<SymbolCategory[]>(SYMBOL_CATEGORIES_ADMIN_PATH, {
    searchParams: compactFilters(filters),
  });
}

export async function listAllSymbolCategories(): Promise<SymbolCategory[]> {
  const categories: SymbolCategory[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await listSymbolCategories({ page, per_page: 100 });
    categories.push(...response.data);
    lastPage = response.meta.pagination?.last_page ?? page;
    page += 1;
  } while (page <= lastPage);

  return categories;
}

export async function createSymbolCategory(
  input: CreateSymbolCategoryInput,
): Promise<BrokerSuccessResponse<SymbolCategory>> {
  return browserBrokerRequest<SymbolCategory>(SYMBOL_CATEGORIES_ADMIN_PATH, {
    method: "POST",
    body: input,
  });
}

export async function updateSymbolCategory(
  categoryId: string,
  input: UpdateSymbolCategoryInput,
): Promise<BrokerSuccessResponse<SymbolCategory>> {
  return browserBrokerRequest<SymbolCategory>(
    `${SYMBOL_CATEGORIES_ADMIN_PATH}/${categoryId}`,
    { method: "PATCH", body: input },
  );
}

export async function deleteSymbolCategory(
  categoryId: string,
): Promise<BrokerSuccessResponse<void>> {
  return browserBrokerRequest<void>(
    `${SYMBOL_CATEGORIES_ADMIN_PATH}/${categoryId}`,
    { method: "DELETE" },
  );
}
