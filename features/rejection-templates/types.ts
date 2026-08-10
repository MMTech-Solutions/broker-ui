/**
 * Admin rejection templates (`v1/admin/rejection-templates`).
 * Full CRUD requires `broker.rejection_templates.manage` (enforced by API; UI does not gate nav).
 */
export type RejectionTemplateCategory =
  | "ib_plans"
  | "insurance"
  | "contests";

export type RejectionTemplate = {
  id: string;
  category: RejectionTemplateCategory | string;
  title: string;
  body: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RejectionTemplateListFilters = {
  category?: RejectionTemplateCategory | string;
  title?: string;
  body?: string;
  page?: number;
  per_page?: number;
};

export type CreateRejectionTemplateInput = {
  category: RejectionTemplateCategory | string;
  title: string;
  body: string;
};

export type UpdateRejectionTemplateInput = {
  category?: RejectionTemplateCategory | string;
  title?: string;
  body?: string;
};

export const REJECTION_TEMPLATE_CATEGORIES: {
  value: RejectionTemplateCategory;
  label: string;
}[] = [
  { value: "ib_plans", label: "IB plans" },
  { value: "insurance", label: "Insurance" },
  { value: "contests", label: "Contests" },
];

export function rejectionTemplateCategoryLabel(
  category: string | undefined | null,
): string {
  if (!category) {
    return "—";
  }

  const match = REJECTION_TEMPLATE_CATEGORIES.find(
    (option) => option.value === category,
  );

  return match?.label ?? category;
}
