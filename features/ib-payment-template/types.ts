export type IbPaymentTemplateLevel = {
  id: string;
  name: string;
  rate: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type IbPaymentTemplate = {
  id: string;
  name: string;
  levels?: IbPaymentTemplateLevel[];
  created_at?: string;
  updated_at?: string;
};

export type IbPaymentTemplateListFilters = {
  name?: string;
  page?: number;
  per_page?: number;
};

export type CreateIbPaymentTemplateLevelInput = {
  name: string;
  rate: number;
  sort_order?: number;
};

export type CreateIbPaymentTemplateInput = {
  name: string;
  levels: CreateIbPaymentTemplateLevelInput[];
};

export type UpdateIbPaymentTemplateLevelInput = {
  name?: string;
  rate?: number;
  sort_order?: number;
};

export type IbPaymentTemplateLevelDraft = {
  key: string;
  name: string;
  ratePercent: string;
  sort_order: number;
};
