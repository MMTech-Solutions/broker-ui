export const MASKED_SECRET_VALUE = "********";

export type ConfigSchemaOption = {
  value: string;
  label: string;
};

export type ConfigSchema = {
  type: "string" | "text" | "integer" | "number" | "bool" | "select" | "file";
  required: boolean;
  label: string;
  placeholder?: string;
  secret?: boolean;
  options?: ConfigSchemaOption[];
  min?: number;
  max?: number;
  help?: string;
};

export type BrokerConfig = {
  id: string;
  key: string;
  category: string;
  value: string | null;
  is_secret: boolean;
  schema: ConfigSchema;
  updated_at: string | null;
};

export type UpdateConfigsBatchInput = {
  configs: Array<{ key: string; value: string | null }>;
};
