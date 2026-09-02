export type FormState = "draft" | "published" | "archived";

export type JwfOption = { id: string; value: string; label: string; disabled: boolean; attributes: Record<string, unknown> };
export type JwfInputType = "text" | "textarea" | "email" | "url" | "password" | "number" | "date" | "time" | "checkbox" | "select" | "radio" | "hidden" | "file";
export type JwfNode = { kind: "container" | "form" | "input"; id: string; position: number; name?: string; type?: JwfInputType; label?: string | null; description?: string | null; attributes: Record<string, unknown>; configuration?: Record<string, unknown>; options?: JwfOption[]; validation_profile_versions?: unknown[]; children?: JwfNode[] };
export type JwfDocument = { schema_version: number; kind: "document"; id: string; state: FormState; root: JwfNode };
export type FormVersion = { id: string; template_id: string; number: number; state: FormState; document?: JwfDocument; created_at?: string; updated_at?: string };
export type FormTemplate = { id: string; name: string; versions: Omit<FormVersion, "template_id" | "document">[]; created_at?: string; updated_at?: string };
export type FormListFilters = { name?: string; state?: FormState; page?: number; per_page?: number };

export const FORM_INPUT_TYPES: { value: JwfInputType | "container"; label: string }[] = [
  { value: "text", label: "Text" }, { value: "textarea", label: "Textarea" }, { value: "email", label: "Email" }, { value: "url", label: "URL" }, { value: "password", label: "Password" }, { value: "number", label: "Number" }, { value: "date", label: "Date" }, { value: "time", label: "Time" }, { value: "checkbox", label: "Checkbox" }, { value: "select", label: "Select" }, { value: "radio", label: "Radio" }, { value: "hidden", label: "Hidden" }, { value: "container", label: "Container" },
];
