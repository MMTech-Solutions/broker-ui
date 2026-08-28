"use client";

import { useCallback, useEffect, useState } from "react";
import { ArchiveIcon, CopyIcon, EyeIcon, PlusIcon, SaveIcon, SendIcon, Trash2Icon } from "lucide-react";
import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBrokerApiError } from "@/lib/api/errors";
import { archiveFormVersion, cloneFormVersion, createForm, deleteForm, getFormVersion, listForms, publishFormVersion, saveFormDraft } from "@/features/forms/api";
import { createJwfId } from "@/features/forms/lib/create-jwf-id";
import { FORM_INPUT_TYPES, type FormTemplate, type FormVersion, type JwfDocument, type JwfInputType, type JwfNode } from "@/features/forms/types";

function formVersion(template: FormTemplate) { return template.versions.find((version) => version.state === "draft") ?? template.versions[0]; }
function addNode(document: JwfDocument, kind: JwfInputType | "container"): JwfDocument {
  const root = structuredClone(document.root); const form = root.children?.find((node) => node.kind === "form");
  if (!form) return document;
  const children = form.children ?? []; const position = children.length;
  const node: JwfNode = kind === "container" ? { kind, id: createJwfId(), position, attributes: {}, children: [] } : { kind: "input", id: createJwfId(), position, type: kind, name: `${kind}_${position + 1}`, label: `${kind[0].toUpperCase()}${kind.slice(1)} ${position + 1}`, description: null, attributes: {}, configuration: {}, options: kind === "select" || kind === "radio" ? [{ id: createJwfId(), value: "option_1", label: "Option 1", disabled: false, attributes: {} }] : [], validation_profile_versions: [] };
  form.children = [...children, node]; return { ...document, root };
}

function removeNode(document: JwfDocument, nodeId: string): JwfDocument {
  const root = structuredClone(document.root);
  const form = root.children?.find((node) => node.kind === "form");
  if (!form?.children?.some((node) => node.id === nodeId)) return document;

  form.children = form.children
    .filter((node) => node.id !== nodeId)
    .map((node, position) => ({ ...node, position }));

  return { ...document, root };
}

export function FormsView() {
  const [forms, setForms] = useState<FormTemplate[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(""); const [editor, setEditor] = useState<{ template: FormTemplate; version: FormVersion; document: JwfDocument; readOnly: boolean } | null>(null);
  const load = useCallback(async () => { setLoading(true); try { const response = await listForms({ per_page: 50 }); setForms(response.data); setError(null); } catch (cause) { setError(formatBrokerApiError(cause)); } finally { setLoading(false); } }, []);
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
  async function create() { if (!name.trim()) return; try { await createForm(name.trim()); setName(""); await load(); } catch (cause) { setError(formatBrokerApiError(cause)); } }
  async function open(template: FormTemplate, readOnly = false) { const selected = formVersion(template); if (!selected) return; try { let version = selected; if (!readOnly && selected.state !== "draft") version = (await cloneFormVersion(template.id, selected.id)).data; const response = await getFormVersion(template.id, version.id); if (response.data.document) setEditor({ template, version: response.data, document: response.data.document, readOnly }); await load(); } catch (cause) { setError(formatBrokerApiError(cause)); } }
  async function save() { if (!editor) return; try { await saveFormDraft(editor.template.id, editor.version.id, editor.document); await load(); } catch (cause) { setError(formatBrokerApiError(cause)); } }
  async function publish() { if (!editor) return; try { await publishFormVersion(editor.template.id, editor.version.id); setEditor(null); await load(); } catch (cause) { setError(formatBrokerApiError(cause)); } }
  async function remove(template: FormTemplate) { if (!window.confirm(`Delete ${template.name}?`)) return; try { await deleteForm(template.id); await load(); } catch (cause) { setError(formatBrokerApiError(cause)); } }
  async function archive(template: FormTemplate) { const published = template.versions.find((version) => version.state === "published"); if (!published) return; try { await archiveFormVersion(template.id, published.id); await load(); } catch (cause) { setError(formatBrokerApiError(cause)); } }
  return <div className="flex flex-1 flex-col gap-4 p-4">
    <div className="flex flex-wrap items-end gap-2 rounded-xl border p-4"><div className="space-y-2"><Label htmlFor="form-name">New form name</Label><Input id="form-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Additional KYC" /></div><Button onClick={() => void create()}><PlusIcon />Create form</Button></div>
    {error ? <ApiErrorAlert title="Forms" message={error} /> : null}
    <div className="rounded-xl border"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Versions</TableHead><TableHead>Published</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={4}>Loading forms…</TableCell></TableRow> : forms.length === 0 ? <TableRow><TableCell colSpan={4}>No forms created yet.</TableCell></TableRow> : forms.map((template) => { const active = template.versions.find((version) => version.state === "published"); return <TableRow key={template.id}><TableCell className="font-medium">{template.name}</TableCell><TableCell>{template.versions.length}</TableCell><TableCell>{active ? `v${active.number}` : "—"}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" title="Preview" onClick={() => void open(template, true)}><EyeIcon /></Button><Button size="icon-sm" variant="ghost" title="Edit" onClick={() => void open(template)}><CopyIcon /></Button>{active ? <Button size="icon-sm" variant="ghost" title="Archive" onClick={() => void archive(template)}><ArchiveIcon /></Button> : null}<Button size="icon-sm" variant="ghost" title="Delete" onClick={() => void remove(template)}><Trash2Icon /></Button></div></TableCell></TableRow>; })}</TableBody></Table></div>
    <Sheet open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}><SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto"><SheetHeader><SheetTitle>{editor?.template.name}</SheetTitle><SheetDescription>{editor?.readOnly ? "Published version preview" : `Draft version ${editor?.version.number}`}</SheetDescription></SheetHeader>{editor ? <div className="space-y-4 p-4"><div className="flex flex-wrap gap-2">{FORM_INPUT_TYPES.map((item) => <Button key={item.value} size="sm" variant="outline" disabled={editor.readOnly} draggable={!editor.readOnly} onDragStart={(event) => event.dataTransfer.setData("jwf-type", item.value)} onClick={() => setEditor({ ...editor, document: addNode(editor.document, item.value) })}>{item.label}</Button>)}</div><div className="min-h-72 rounded-xl border border-dashed p-4" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const type = event.dataTransfer.getData("jwf-type") as JwfInputType | "container"; if (type) setEditor({ ...editor, document: addNode(editor.document, type) }); }}><p className="mb-3 text-sm text-muted-foreground">Drag fields here or use the palette.</p>{editor.document.root.children?.find((node) => node.kind === "form")?.children?.map((node, index) => <div key={node.id} className="mb-2 rounded border p-3"><div className="flex items-center justify-between gap-2"><span>{node.kind === "input" ? `${node.type}: ${node.label}` : "Container"}</span>{!editor.readOnly ? <div className="flex items-center gap-2">{node.kind === "input" ? <Input className="max-w-48" value={node.label ?? ""} onChange={(event) => { const copy = structuredClone(editor.document); const form = copy.root.children?.find((item) => item.kind === "form"); const target = form?.children?.[index]; if (target) target.label = event.target.value; setEditor({ ...editor, document: copy }); }} /> : null}<Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" title="Remove element" aria-label={`Remove ${node.kind === "input" ? node.label ?? node.type : "container"}`} onClick={() => setEditor({ ...editor, document: removeNode(editor.document, node.id) })}><Trash2Icon /></Button></div> : null}</div></div>)}</div>{!editor.readOnly ? <div className="flex gap-2"><Button onClick={() => void save()}><SaveIcon />Save draft</Button><Button onClick={() => void publish()}><SendIcon />Publish</Button></div> : null}</div> : null}</SheetContent></Sheet>
  </div>;
}
