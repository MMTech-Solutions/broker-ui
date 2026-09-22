/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createIbProgressionTemplate,
  deleteIbProgressionTemplate,
  listIbProgressionTemplates,
  updateIbProgressionTemplate,
} from "@/features/ib-progression-template/api";
import type {
  IbProgressionTemplate,
  IbProgressionTemplateLevelInput,
} from "@/features/ib-progression-template/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type TemplateFormProps = {
  open: boolean;
  template: IbProgressionTemplate | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

function TemplateForm({ open, template, onOpenChange, onSaved }: TemplateFormProps) {
  const [name, setName] = useState("");
  const [levels, setLevels] = useState<IbProgressionTemplateLevelInput[]>([
    { level: 0, volume_coefficient: 1 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(template?.name ?? "");
    setLevels(
      template?.levels?.map((level) => ({
        level: level.level,
        volume_coefficient: Number(level.volume_coefficient),
      })) ?? [{ level: 0, volume_coefficient: 1 }],
    );
    setError(null);
  }, [open, template]);

  function updateLevel(index: number, value: Partial<IbProgressionTemplateLevelInput>) {
    setLevels((current) => current.map((level, currentIndex) =>
      currentIndex === index ? { ...level, ...value } : level,
    ));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("A template name is required.");
      return;
    }
    if (levels.some((level) => level.level < 0 || !Number.isFinite(level.volume_coefficient) || level.volume_coefficient < 0) || new Set(levels.map((level) => level.level)).size !== levels.length) {
      setError("Each level must be unique and have a non-negative coefficient.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (template) {
        await updateIbProgressionTemplate(template.id, {
          name: name.trim(),
          levels,
        });
      } else {
        await createIbProgressionTemplate({ name: name.trim(), levels });
      }
      onOpenChange(false);
      onSaved();
    } catch (requestError) {
      setError(formatBrokerApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{template ? "Edit progression template" : "New progression template"}</DialogTitle>
          <DialogDescription>
            Set the volume coefficient contributed by each referral level.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? <ApiErrorAlert message={error} /> : null}
          <div className="space-y-2">
            <Label htmlFor="progression-template-name">Name</Label>
            <Input id="progression-template-name" value={name} onChange={(event) => setName(event.target.value)} disabled={submitting} required />
          </div>
          <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Rules by referral level</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => setLevels((current) => [...current, { level: current.length, volume_coefficient: 1 }])}>
                  <PlusIcon /> Add level
                </Button>
              </div>
              {levels.map((level, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input aria-label="Referral level" type="number" min={0} value={level.level} onChange={(event) => updateLevel(index, { level: Number(event.target.value) })} disabled={submitting} />
                  <Input aria-label="Volume coefficient" type="number" min={0} step="0.000001" value={level.volume_coefficient} onChange={(event) => updateLevel(index, { volume_coefficient: Number(event.target.value) })} disabled={submitting} />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => setLevels((current) => current.filter((_, currentIndex) => currentIndex !== index))} disabled={submitting || levels.length === 1} aria-label="Remove level"><Trash2Icon /></Button>
                </div>
              ))}
            </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function IbProgressionTemplatesView() {
  const [templates, setTemplates] = useState<IbProgressionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IbProgressionTemplate | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listIbProgressionTemplates({ per_page: 100 });
      setTemplates(response.data);
    } catch (requestError) {
      setError(formatBrokerApiError(requestError));
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(template: IbProgressionTemplate) {
    if (!window.confirm('Delete "' + template.name + '"?')) return;
    try {
      await deleteIbProgressionTemplate(template.id);
      await load();
    } catch (requestError) {
      setError(formatBrokerApiError(requestError));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex justify-end">
        <Button onClick={() => { setSelectedTemplate(null); setFormOpen(true); }}><PlusIcon /> New progression template</Button>
      </div>
      {error ? <ApiErrorAlert title="Could not manage progression templates" message={error} /> : null}
      <div className="rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Rules</TableHead><TableHead className="w-24 text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? Array.from({ length: 4 }).map((_, index) => <TableRow key={index}><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>) : null}
            {!loading && templates.length === 0 ? <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No progression templates found.</TableCell></TableRow> : null}
            {!loading ? templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell className="text-muted-foreground">{template.levels?.map((level) => "L" + level.level + ": ×" + level.volume_coefficient).join(" · ") || "—"}</TableCell>
                <TableCell><div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => { setSelectedTemplate(template); setFormOpen(true); }} aria-label={"Rename " + template.name}><PencilIcon /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => void handleDelete(template)} aria-label={"Delete " + template.name}><Trash2Icon /></Button>
                </div></TableCell>
              </TableRow>
            )) : null}
          </TableBody>
        </Table>
      </div>
      <TemplateForm open={formOpen} template={selectedTemplate} onOpenChange={setFormOpen} onSaved={() => void load()} />
    </div>
  );
}
