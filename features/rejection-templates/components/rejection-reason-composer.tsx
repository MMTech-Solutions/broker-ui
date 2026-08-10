"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { Checkbox } from "@/components/ui/checkbox";
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
  listRejectionTemplates,
} from "@/features/rejection-templates/api";
import type {
  RejectionTemplate,
  RejectionTemplateCategory,
} from "@/features/rejection-templates/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const NONE_TEMPLATE_VALUE = "__none__";
const TEMPLATE_TITLE_MAX = 120;
const TEMPLATE_BODY_MAX = 2000;

export type RejectionReasonComposerHandle = {
  prepareSubmit: () => Promise<{ body: string }>;
  reset: () => void;
};

export type RejectionReasonComposerProps = {
  category: RejectionTemplateCategory;
  open: boolean;
  value: string;
  onChange: (body: string) => void;
  disabled?: boolean;
  bodyLabel?: string;
  bodyRequired?: boolean;
  bodyMaxLength?: number;
  bodyPlaceholder?: string;
  idPrefix?: string;
};

export const RejectionReasonComposer = forwardRef<
  RejectionReasonComposerHandle,
  RejectionReasonComposerProps
>(function RejectionReasonComposer(
  {
    category,
    open,
    value,
    onChange,
    disabled = false,
    bodyLabel = "Reason",
    bodyRequired = false,
    bodyMaxLength,
    bodyPlaceholder = "Write the rejection reason",
    idPrefix = "rejection-reason",
  },
  ref,
) {
  const [templates, setTemplates] = useState<RejectionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState(NONE_TEMPLATE_VALUE);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");

  const resetLocalState = useCallback(() => {
    setSelectedTemplateId(NONE_TEMPLATE_VALUE);
    setSaveAsTemplate(false);
    setTemplateTitle("");
    setTemplatesError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetLocalState();

    let cancelled = false;

    async function loadTemplates() {
      setLoadingTemplates(true);
      setTemplatesError(null);

      try {
        const response = await listRejectionTemplates({
          category,
          per_page: 100,
        });

        if (!cancelled) {
          setTemplates(response.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setTemplates([]);
          setTemplatesError(formatBrokerApiError(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoadingTemplates(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      cancelled = true;
    };
  }, [open, category, resetLocalState]);

  useImperativeHandle(
    ref,
    () => ({
      reset: resetLocalState,
      prepareSubmit: async () => {
        const body = value.trim();

        if (bodyRequired && body === "") {
          throw new Error(`${bodyLabel} is required.`);
        }

        if (bodyMaxLength !== undefined && body.length > bodyMaxLength) {
          throw new Error(
            `${bodyLabel} must be at most ${bodyMaxLength} characters.`,
          );
        }

        if (saveAsTemplate && selectedTemplateId === NONE_TEMPLATE_VALUE) {
          const title = templateTitle.trim();

          if (title === "") {
            throw new Error("Template title is required to save as a template.");
          }

          if (title.length > TEMPLATE_TITLE_MAX) {
            throw new Error(
              `Template title must be at most ${TEMPLATE_TITLE_MAX} characters.`,
            );
          }

          if (body === "") {
            throw new Error("Body is required to save as a template.");
          }

          if (body.length > TEMPLATE_BODY_MAX) {
            throw new Error(
              `Template body must be at most ${TEMPLATE_BODY_MAX} characters.`,
            );
          }

          await createRejectionTemplate({
            category,
            title,
            body,
          });
        }

        return { body };
      },
    }),
    [
      bodyLabel,
      bodyMaxLength,
      bodyRequired,
      category,
      resetLocalState,
      saveAsTemplate,
      selectedTemplateId,
      templateTitle,
      value,
    ],
  );

  const usingExistingTemplate = selectedTemplateId !== NONE_TEMPLATE_VALUE;
  const canSaveAsTemplate = !usingExistingTemplate;

  function handleTemplateChange(nextId: string | null) {
    const resolvedId = nextId ?? NONE_TEMPLATE_VALUE;
    setSelectedTemplateId(resolvedId);

    if (resolvedId === NONE_TEMPLATE_VALUE) {
      return;
    }

    setSaveAsTemplate(false);
    setTemplateTitle("");

    const selected = templates.find((template) => template.id === resolvedId);
    if (selected) {
      onChange(selected.body);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-template`}>Template (optional)</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={handleTemplateChange}
          disabled={disabled || loadingTemplates}
        >
          <SelectTrigger id={`${idPrefix}-template`} className="w-full">
            <SelectValue
              placeholder={
                loadingTemplates ? "Loading templates…" : "None (write your own)"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_TEMPLATE_VALUE}>
              None (write your own)
            </SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {templatesError ? (
          <p className="text-xs text-muted-foreground">
            Could not load templates. You can still write a custom reason.
          </p>
        ) : null}
        {!loadingTemplates && !templatesError && templates.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No templates for this area yet. Write a custom reason below.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-body`}>
          {bodyLabel}
          {bodyRequired ? "" : " (optional)"}
        </Label>
        <textarea
          id={`${idPrefix}-body`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={4}
          maxLength={bodyMaxLength}
          placeholder={bodyPlaceholder}
          className={cn(
            "flex min-h-24 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
          )}
        />
        {bodyMaxLength !== undefined ? (
          <p className="text-xs text-muted-foreground">
            {value.length}/{bodyMaxLength}
          </p>
        ) : null}
      </div>

      {canSaveAsTemplate ? (
        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id={`${idPrefix}-save-template`}
              checked={saveAsTemplate}
              onCheckedChange={(checked) => {
                const next = checked === true;
                setSaveAsTemplate(next);
                if (!next) {
                  setTemplateTitle("");
                }
              }}
              disabled={disabled}
            />
            <div className="space-y-1">
              <Label
                htmlFor={`${idPrefix}-save-template`}
                className="cursor-pointer font-normal"
              >
                Save as new template
              </Label>
              <p className="text-xs text-muted-foreground">
                Keep this copy for later. Leave unchecked to use it only this
                time.
              </p>
            </div>
          </div>

          {saveAsTemplate ? (
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-template-title`}>
                Template title
              </Label>
              <Input
                id={`${idPrefix}-template-title`}
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
                disabled={disabled}
                maxLength={TEMPLATE_TITLE_MAX}
                placeholder="Short label for this template"
              />
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Using an existing template. Edit the body for this case only; switch
          to “None (write your own)” to save a new template.
        </p>
      )}
    </div>
  );
});
