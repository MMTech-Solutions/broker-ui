export type SymbolCategory = {
  id: string;
  name: string;
};

export type SymbolCategoryListFilters = {
  name?: string;
  page?: number;
  per_page?: number;
};

export type CreateSymbolCategoryInput = {
  name: string;
};

export type UpdateSymbolCategoryInput = {
  name: string;
};
