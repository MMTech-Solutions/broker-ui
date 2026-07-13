"use client";

import { useEffect, useState } from "react";

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
  volume_factor: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: "",
  custom_name: "",
  volume_factor: "1",
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
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);

    if (mode === "edit" && platform) {
      setForm({
        name: platform.name,
        custom_name: platform.custom_name ?? "",
        volume_factor: String(platform.volume_factor),
        is_active: platform.is_active ?? true,
      });
      return;
    }

    setForm(emptyForm);
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const volumeFactor = Number.parseInt(form.volume_factor, 10);

    if (Number.isNaN(volumeFactor)) {
      setError("volume_factor: must be a valid integer.");
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "create") {
        if (!form.name) {
          setError("name: is required.");
          return;
        }

        await createPlatform({
          name: form.name,
          custom_name: form.custom_name.trim() || null,
          volume_factor: volumeFactor,
          is_active: form.is_active,
        });
      } else if (platform) {
        const payload: UpdatePlatformInput = {
          custom_name: form.custom_name.trim() || null,
          volume_factor: volumeFactor,
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
                      loadingOptions ? "Loading options..." : "Select platform"
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
            <Label htmlFor="platform-volume-factor">Volume factor</Label>
            <Input
              id="platform-volume-factor"
              type="number"
              min={1}
              value={form.volume_factor}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  volume_factor: event.target.value,
                }))
              }
              disabled={submitting}
              required
            />
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
