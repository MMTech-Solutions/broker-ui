"use client";

import { useEffect, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRejectionTemplate,
  updateRejectionTemplate,
} from "@/features/rejection-templates/api";
import {
  REJECTION_TEMPLATE_CATEGORIES,
  type RejectionTemplate,
  type RejectionTemplateCategory,
} from "@/features/rejection-templates/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type RejectionTemplateFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  template?: RejectionTemplate | null;
  onSuccess: () => void;
};

type FormState = {
  category: RejectionTemplateCategory;
  title: string;
  body: string;
};

const emptyForm: FormState = {
  category: "ib_plans",
  title: "",
  body: "",
};

const TITLE_MAX = 120;
const BODY_MAX = 2000;

export function RejectionTemplateFormDialog({
  open,
  onOpenChange,
  mode,
  template,
  onSuccess,
}: RejectionTemplateFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && template) {
      const category = REJECTION_TEMPLATE_CATEGORIES.some(
        (option) => option.value === template.category,
      )
        ? (template.category as RejectionTemplateCategory)
        : "ib_plans";

      setForm({
        category,
        title: template.title,
        body: template.body,
      });
      return;
    }

    setForm(emptyForm);
  }, [open, mode, template]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const title = form.title.trim();
    const body = form.body.trim();

    if (!title) {
      setError("Title is required.");
      return;
    }

    if (title.length > TITLE_MAX) {
      setError(`Title must be at most ${TITLE_MAX} characters.`);
      return;
    }

    if (!body) {
      setError("Body is required.");
      return;
    }

    if (body.length > BODY_MAX) {
      setError(`Body must be at most ${BODY_MAX} characters.`);
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "create") {
        await createRejectionTemplate({
          category: form.category,
          title,
          body,
        });
      } else if (template) {
        await updateRejectionTemplate(template.id, {
          category: form.category,
          title,
          body,
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (submitError) {
      setError(formatBrokerApiError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create"
              ? "Create rejection template"
              : "Edit rejection template"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Reusable rejection copy for operators by area (IB plans, insurance, contests)."
              : `Update template “${template?.title ?? "template"}”.`}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto py-4">
            {error ? (
              <ApiErrorAlert
                title={
                  mode === "create"
                    ? "Could not create template"
                    : "Could not update template"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="rejection-template-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    category: (value ??
                      "ib_plans") as RejectionTemplateCategory,
                  }))
                }
                disabled={submitting}
              >
                <SelectTrigger
                  id="rejection-template-category"
                  className="w-full"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_TEMPLATE_CATEGORIES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection-template-title">Title</Label>
              <Input
                id="rejection-template-title"
                value={form.title}
                maxLength={TITLE_MAX}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Suggestive short label"
                disabled={submitting}
                required
              />
              <p className="text-xs text-muted-foreground">
                {form.title.length}/{TITLE_MAX}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection-template-body">Body</Label>
              <textarea
                id="rejection-template-body"
                value={form.body}
                maxLength={BODY_MAX}
                rows={6}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    body: event.target.value,
                  }))
                }
                placeholder="Rejection reason text shown to operators / copied into domain rejects"
                disabled={submitting}
                required
                className={cn(
                  "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />
              <p className="text-xs text-muted-foreground">
                {form.body.length}/{BODY_MAX}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
