"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArchiveIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  archiveFormVersion,
  cloneFormVersion,
  createForm,
  deleteForm,
  listForms,
} from "@/features/forms/api";
import type { FormTemplate, FormVersion } from "@/features/forms/types";
import { formatBrokerApiError } from "@/lib/api/errors";

function editableVersion(template: FormTemplate) {
  return (
    template.versions.find((version) => version.state === "draft") ??
    template.versions[0]
  );
}

function previewVersion(template: FormTemplate) {
  return (
    template.versions.find((version) => version.state === "published") ??
    editableVersion(template)
  );
}

function formatVersionDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function builderPath(
  templateId: string,
  versionId: string,
  preview = false,
) {
  const path = `/forms/${templateId}/versions/${versionId}`;
  return preview ? `${path}?tab=preview&readonly=1` : path;
}

export function FormsListView() {
  const router = useRouter();
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listForms({ per_page: 50 });
      setForms(response.data);
      setError(null);
    } catch (cause) {
      setError(formatBrokerApiError(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    listForms({ per_page: 50 })
      .then((response) => {
        if (cancelled) return;
        setForms(response.data);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(formatBrokerApiError(cause));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function create() {
    if (!name.trim()) return;

    try {
      const response = await createForm(name.trim());
      const draft = editableVersion(response.data);
      setName("");

      if (draft) {
        router.push(builderPath(response.data.id, draft.id));
        return;
      }

      await load();
    } catch (cause) {
      setError(formatBrokerApiError(cause));
    }
  }

  async function openEditor(template: FormTemplate) {
    const selected = editableVersion(template);
    if (!selected) return;

    try {
      let version: Pick<FormVersion, "id" | "state"> = selected;
      if (selected.state !== "draft") {
        version = (await cloneFormVersion(template.id, selected.id)).data;
      }

      router.push(builderPath(template.id, version.id));
    } catch (cause) {
      setError(formatBrokerApiError(cause));
    }
  }

  function openPreview(template: FormTemplate) {
    const selected = previewVersion(template);
    if (!selected) return;
    router.push(builderPath(template.id, selected.id, true));
  }

  async function remove(template: FormTemplate) {
    if (!window.confirm(`Delete ${template.name}?`)) return;

    try {
      await deleteForm(template.id);
      await load();
    } catch (cause) {
      setError(formatBrokerApiError(cause));
    }
  }

  async function archive(template: FormTemplate) {
    const published = template.versions.find(
      (version) => version.state === "published",
    );
    if (!published) return;

    try {
      await archiveFormVersion(template.id, published.id);
      await load();
    } catch (cause) {
      setError(formatBrokerApiError(cause));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-wrap items-end gap-2 rounded-xl border p-4">
        <div className="space-y-2">
          <Label htmlFor="form-name">New form name</Label>
          <Input
            id="form-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Additional KYC"
          />
        </div>
        <Button onClick={() => void create()}>
          <PlusIcon />
          Create form
        </Button>
      </div>

      {error ? <ApiErrorAlert title="Forms" message={error} /> : null}

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Total versions</TableHead>
              <TableHead>Draft</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Archived</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8}>Loading forms…</TableCell>
              </TableRow>
            ) : forms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>No forms created yet.</TableCell>
              </TableRow>
            ) : (
              forms.map((template) => {
                const draft = template.versions.find(
                  (version) => version.state === "draft",
                );
                const published = template.versions.find(
                  (version) => version.state === "published",
                );
                const archived = template.versions.filter(
                  (version) => version.state === "archived",
                );

                return (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>{template.versions.length}</TableCell>
                    <TableCell>
                      {draft ? <Badge variant="outline">v{draft.number}</Badge> : "—"}
                    </TableCell>
                    <TableCell>
                      {published ? <Badge>v{published.number}</Badge> : "—"}
                    </TableCell>
                    <TableCell>
                      {archived.length > 0
                        ? archived.map((version) => `v${version.number}`).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>{formatVersionDate(template.created_at)}</TableCell>
                    <TableCell>
                      {formatVersionDate(template.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Preview"
                          onClick={() => openPreview(template)}
                        >
                          <EyeIcon />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Edit"
                          onClick={() => void openEditor(template)}
                        >
                          <PencilIcon />
                        </Button>
                        {published ? (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Archive"
                            onClick={() => void archive(template)}
                          >
                            <ArchiveIcon />
                          </Button>
                        ) : null}
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete"
                          onClick={() => void remove(template)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
