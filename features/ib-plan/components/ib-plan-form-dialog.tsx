"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { Trash2Icon } from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createIbPlan, updateIbPlan } from "@/features/ib-plan/api";
import {
  IB_PLAN_SUBSCRIPTION_TYPES,
  type IbPlan,
  type IbPlanSubscriptionType,
} from "@/features/ib-plan/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { getFormVersion, listForms } from "@/features/forms/api";
import type { FormTemplate, JwfNode } from "@/features/forms/types";

const IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

type IbPlanFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  ibPlan?: IbPlan | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  description: string;
  subscription_type: IbPlanSubscriptionType;
  is_active: boolean;
  form_template_id: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  subscription_type: "automatic",
  is_active: false,
  form_template_id: "",
};

function compatibleIbForm(node: JwfNode): { forms: number; hasFile: boolean } {
  return (node.children ?? []).reduce<{ forms: number; hasFile: boolean }>(
    (result, child) => {
      const nested = compatibleIbForm(child);
      return {
        forms: result.forms + nested.forms + (child.kind === "form" ? 1 : 0),
        hasFile: result.hasFile || nested.hasFile || (child.kind === "input" && child.type === "file"),
      };
    },
    { forms: 0, hasFile: false },
  );
}

export function IbPlanFormDialog({
  open,
  onOpenChange,
  mode,
  ibPlan,
  onSuccess,
}: IbPlanFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);

  const canActivate = mode === "edit" && (ibPlan?.programs_count ?? 0) > 0;

  useEffect(() => {
    if (!imageFile) {
      setImageObjectUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImageObjectUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const imagePreviewUrl = useMemo(() => {
    if (imageObjectUrl) {
      return imageObjectUrl;
    }

    if (removeImage) {
      return null;
    }

    return currentImageUrl;
  }, [imageObjectUrl, currentImageUrl, removeImage]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setImageFile(null);
    setRemoveImage(false);
    void listForms({ state: "published", per_page: 100 })
      .then(async (response) => {
        const checked = await Promise.all(response.data.map(async (template) => {
          const published = template.versions.find((version) => version.state === "published");
          if (!published) return null;
          const version = await getFormVersion(template.id, published.id);
          const compatibility = version.data.document ? compatibleIbForm(version.data.document.root) : null;
          return compatibility?.forms === 1 && !compatibility.hasFile ? template : null;
        }));
        setFormTemplates(checked.filter((template): template is FormTemplate => template !== null));
      })
      .catch(() => setFormTemplates([]));

    if (mode === "edit" && ibPlan) {
      setForm({
        name: ibPlan.name,
        description: ibPlan.description,
        subscription_type: ibPlan.subscription_type,
        is_active: ibPlan.is_active,
        form_template_id: ibPlan.form_template?.id ?? "",
      });
      setCurrentImageUrl(ibPlan.image_path ?? null);
      return;
    }

    setForm(emptyForm);
    setCurrentImageUrl(null);
  }, [open, mode, ibPlan]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setRemoveImage(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === "create") {
        if (!form.name.trim() || !form.description.trim()) {
          setError("Name and description are required.");
          return;
        }

        await createIbPlan({
          name: form.name.trim(),
          description: form.description.trim(),
          image: imageFile,
          subscription_type: form.subscription_type,
          form_template_id: form.form_template_id || null,
        });
      } else if (ibPlan) {
        await updateIbPlan(ibPlan.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          image: imageFile,
          remove_image: removeImage && !imageFile,
          subscription_type: form.subscription_type,
          form_template_id: form.form_template_id || null,
          is_active: form.is_active,
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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create" ? "Create IB plan" : "Edit IB plan"}
          </DialogTitle>
          <DialogDescription>
            IB plans group programs and define how partners subscribe.
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
                    ? "Could not create IB plan"
                    : "Could not update IB plan"
                }
                message={error}
              />
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="ib-plan-name">Name</Label>
              <Input
                id="ib-plan-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ib-plan-description">Description</Label>
              <textarea
                id="ib-plan-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                disabled={submitting}
                required
                rows={4}
                className={cn(
                  "flex min-h-20 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ib-plan-image-file">Identity image</Label>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG or WebP, max 1MB. Leave empty to keep the current
                image.
              </p>

              {imagePreviewUrl ? (
                <div className="overflow-hidden rounded-lg border bg-muted/30">
                  <img
                    src={imagePreviewUrl}
                    alt="IB plan identity preview"
                    className="max-h-40 w-full object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  No image configured
                </div>
              )}

              <Input
                id="ib-plan-image-file"
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={handleImageChange}
                disabled={submitting}
              />

              {imageFile ? (
                <p className="text-xs text-muted-foreground">
                  Selected: {imageFile.name}
                </p>
              ) : null}

              {(currentImageUrl || imageFile) && !removeImage ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={submitting}
                >
                  <Trash2Icon />
                  Remove image
                </Button>
              ) : null}

              {removeImage ? (
                <p className="text-xs text-muted-foreground">
                  Image will be removed on save.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ib-plan-subscription-type">Subscription type</Label>
              <Select
                value={form.subscription_type}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    subscription_type: (value ??
                      "automatic") as IbPlanSubscriptionType,
                  }))
                }
                disabled={submitting}
              >
                <SelectTrigger id="ib-plan-subscription-type" className="w-full">
                  <SelectValue placeholder="Select subscription type" />
                </SelectTrigger>
                <SelectContent>
                  {IB_PLAN_SUBSCRIPTION_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ib-plan-form-template">Subscription form</Label>
              <Select
                value={form.form_template_id || "none"}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    form_template_id: value === "none" ? "" : (value ?? ""),
                  }))
                }
                disabled={submitting}
              >
                <SelectTrigger id="ib-plan-form-template" className="w-full">
                  <SelectValue placeholder="No form required" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No form required</SelectItem>
                  {formTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only templates with a published version are available.
              </p>
            </div>

            {mode === "create" ? (
              <p className="text-xs text-muted-foreground">
                Plans are created inactive. Attach programs (including a base
                program at sort order 0), then activate the plan when editing.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="ib-plan-is-active"
                    checked={form.is_active}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({
                        ...current,
                        is_active: checked === true,
                      }))
                    }
                    disabled={submitting || (!canActivate && !form.is_active)}
                  />
                  <Label htmlFor="ib-plan-is-active">Active</Label>
                </div>
                {!canActivate ? (
                  <p className="text-xs text-muted-foreground">
                    Attach at least one program (base at sort order 0) before
                    activating this plan.
                  </p>
                ) : null}
              </div>
            )}
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
