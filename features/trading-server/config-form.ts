import type { ConfigSchemaField } from "@/features/trading-server/types";

export const MASKED_SECRET_VALUE = "********";

export function buildEmptyConfig(
  fields: ConfigSchemaField[],
): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

export function configFromTradingServer(
  config: Record<string, string | number>,
  fields: ConfigSchemaField[],
): Record<string, string> {
  const result = buildEmptyConfig(fields);

  for (const field of fields) {
    const value = config[field.key];

    if (value === undefined || value === null) {
      continue;
    }

    if (field.secret && String(value) === MASKED_SECRET_VALUE) {
      result[field.key] = "";
      continue;
    }

    result[field.key] = String(value);
  }

  return result;
}

export function serializeConfigForSubmit(
  config: Record<string, string>,
  fields: ConfigSchemaField[],
  mode: "create" | "edit",
): Record<string, string | number> {
  const payload: Record<string, string | number> = {};

  for (const field of fields) {
    const rawValue = config[field.key]?.trim() ?? "";

    if (mode === "edit" && field.secret && rawValue === "") {
      continue;
    }

    if (!rawValue && !field.required) {
      continue;
    }

    payload[field.key] =
      field.type === "integer" ? Number.parseInt(rawValue, 10) : rawValue;
  }

  return payload;
}

export function getDefaultSchemaId(
  schemas: { id: string; is_default: boolean }[],
): string {
  return schemas.find((schema) => schema.is_default)?.id ?? schemas[0]?.id ?? "";
}
