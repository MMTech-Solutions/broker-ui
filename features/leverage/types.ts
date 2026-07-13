export type Leverage = {
  id: string;
  name: string;
  value: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type LeverageListFilters = {
  name?: string;
  value?: number;
  page?: number;
  per_page?: number;
};

export type CreateLeverageInput = {
  name: string;
  value: number;
};

export type UpdateLeverageInput = {
  name?: string;
  value?: number;
};
