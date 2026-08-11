"use client";

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
import {
  createPlatform,
  listAvailablePlatforms,
  updatePlatform,
} from "@/features/platform/api";
import type {
  AvailablePlatform,
  Platform,
  UpdatePlatformInput,
} from "@/features/platform/types";
import { formatBrokerApiError } from "@/lib/api/errors";

const IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";

type PlatformFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  platform?: Platform | null;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  custom_name: string;
  description: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  custom_name: "",
  description: "",
  is_active: true,
};

export function PlatformFormDialog({
  open,
  onOpenChange,
  mode,
  platform,
  onSuccess,
}: PlatformFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [availablePlatforms, setAvailablePlatforms] = useState<
    AvailablePlatform[]
  >([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (mode === "edit" && platform) {
      setForm({
        name: platform.name,
        custom_name: platform.custom_name ?? "",
        description: platform.description ?? "",
        is_active: platform.is_active ?? true,
      });
      setCurrentImageUrl(platform.image_path ?? null);
      return;
    }

    setForm(emptyForm);
    setCurrentImageUrl(null);
  }, [open, mode, platform]);

  useEffect(() => {
    if (!open || mode !== "create") {
      return;
    }

    let cancelled = false;

    async function loadAvailablePlatforms() {
      setLoadingOptions(true);

      try {
        const response = await listAvailablePlatforms();

        if (!cancelled) {
          setAvailablePlatforms(response.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(formatBrokerApiError(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void loadAvailablePlatforms();

    return () => {
      cancelled = true;
    };
  }, [open, mode]);

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
        if (!form.name) {
          setError("name: is required.");
          return;
        }

        await createPlatform({
          name: form.name,
          custom_name: form.custom_name.trim() || null,
          description: form.description.trim() || null,
          image: imageFile,
          is_active: form.is_active,
        });
      } else if (platform) {
        const payload: UpdatePlatformInput = {
          custom_name: form.custom_name.trim() || null,
          description: form.description.trim() || null,
          image: imageFile,
          remove_image: removeImage && !imageFile,
          is_active: form.is_active,
        };

        await updatePlatform(platform.id, payload);
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
      <DialogContent className="flex max-h-[90vh] min-w-0 flex-col overflow-hidden sm:max-w-md">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {mode === "create" ? "Create platform" : "Edit platform"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Register a trading platform supported by broker-service."
              : `Update settings for ${platform?.name ?? "platform"}.`}
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
                    ? "Could not create platform"
                    : "Could not update platform"
                }
                message={error}
              />
            ) : null}

            {mode === "create" ? (
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform</Label>
                <Select
                  value={form.name || null}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, name: value ?? "" }))
                  }
                  disabled={loadingOptions || submitting}
                >
                  <SelectTrigger id="platform-name" className="w-full">
                    <SelectValue
                      placeholder={
                        loadingOptions
                          ? "Loading options..."
                          : "Select platform"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlatforms.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="platform-name-readonly">Platform</Label>
                <Input
                  id="platform-name-readonly"
                  value={form.name}
                  disabled
                  readOnly
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="platform-custom-name">Custom name</Label>
              <Input
                id="platform-custom-name"
                value={form.custom_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    custom_name: event.target.value,
                  }))
                }
                placeholder="MetaTrader 5"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-description">Description</Label>
              <Input
                id="platform-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Short platform description"
                maxLength={255}
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Max 255 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform-image-file">Icon / image</Label>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG or WebP, max 1MB. Leave empty to keep the current
                image.
              </p>

              {imagePreviewUrl ? (
                <div className="overflow-hidden rounded-lg border bg-muted/30">
                  <img
                    src={imagePreviewUrl}
                    alt="Platform identity preview"
                    className="mx-auto max-h-32 object-contain p-2"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  No image configured
                </div>
              )}

              <Input
                id="platform-image-file"
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

            <div className="flex items-center gap-2">
              <Checkbox
                id="platform-is-active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    is_active: checked === true,
                  }))
                }
                disabled={submitting}
              />
              <Label htmlFor="platform-is-active">Active</Label>
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
