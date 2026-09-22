export type IbProgressionTemplateLevel = {
  id: string;
  level: number;
  volume_coefficient: string;
};

export type IbProgressionTemplate = {
  id: string;
  name: string;
  levels?: IbProgressionTemplateLevel[];
  created_at?: string;
};

export type IbProgressionTemplateListFilters = {
  name?: string;
  page?: number;
  per_page?: number;
};

export type IbProgressionTemplateLevelInput = {
  level: number;
  volume_coefficient: number;
};

export type CreateIbProgressionTemplateInput = {
  name: string;
  levels: IbProgressionTemplateLevelInput[];
};

export type UpdateIbProgressionTemplateInput = {
  name: string;
  levels: IbProgressionTemplateLevelInput[];
};
