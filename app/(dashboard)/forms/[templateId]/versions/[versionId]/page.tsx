import { FormBuilderView } from "@/features/forms/components/form-builder-view";

type FormBuilderPageProps = {
  params: Promise<{ templateId: string; versionId: string }>;
  searchParams: Promise<{ tab?: string; readonly?: string }>;
};

export default async function FormBuilderPage({
  params,
  searchParams,
}: FormBuilderPageProps) {
  const [{ templateId, versionId }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  return (
    <FormBuilderView
      templateId={templateId}
      versionId={versionId}
      initialTab={query.tab === "preview" ? "preview" : "builder"}
      forceReadOnly={query.readonly === "1"}
    />
  );
}
