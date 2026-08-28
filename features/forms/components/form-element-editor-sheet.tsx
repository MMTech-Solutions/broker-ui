"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createJwfId } from "@/features/forms/lib/create-jwf-id";
import type { JwfNode, JwfOption } from "@/features/forms/types";

type FormElementEditorSheetProps = {
  node: JwfNode | null;
  readOnly: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (node: JwfNode) => void;
  onRemove: (nodeId: string) => void;
};

function replaceOption(
  options: JwfOption[],
  optionId: string,
  patch: Partial<JwfOption>,
) {
  return options.map((option) =>
    option.id === optionId ? { ...option, ...patch } : option,
  );
}

export function FormElementEditorSheet({
  node,
  readOnly,
  onOpenChange,
  onChange,
  onRemove,
}: FormElementEditorSheetProps) {
  const supportsOptions =
    node?.kind === "input" &&
    (node.type === "select" || node.type === "radio");

  function patchNode(patch: Partial<JwfNode>) {
    if (!node || readOnly) return;
    onChange({ ...node, ...patch });
  }

  function patchAttributes(patch: Record<string, unknown>) {
    if (!node) return;
    patchNode({ attributes: { ...node.attributes, ...patch } });
  }

  function addOption() {
    if (!node) return;
    const position = (node.options ?? []).length + 1;
    patchNode({
      options: [
        ...(node.options ?? []),
        {
          id: createJwfId(),
          value: `option_${position}`,
          label: `Option ${position}`,
          disabled: false,
          attributes: {},
        },
      ],
    });
  }

  return (
    <Sheet open={node !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>
            {node?.kind === "input" ? "Edit input" : "Edit container"}
          </SheetTitle>
          <SheetDescription>
            Changes remain local until you save the draft.
          </SheetDescription>
        </SheetHeader>

        {node ? (
          <div className="space-y-6 px-4 pb-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="element-kind">Element type</Label>
                <Input
                  id="element-kind"
                  value={node.kind === "input" ? node.type : node.kind}
                  disabled
                />
              </div>

              {node.kind === "input" ? (
                <div className="space-y-2">
                  <Label htmlFor="element-name">Technical name</Label>
                  <Input
                    id="element-name"
                    value={node.name ?? ""}
                    disabled={readOnly}
                    onChange={(event) => patchNode({ name: event.target.value })}
                  />
                </div>
              ) : null}
            </div>

            {node.kind === "input" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="element-label">Label</Label>
                  <Input
                    id="element-label"
                    value={node.label ?? ""}
                    disabled={readOnly}
                    onChange={(event) => patchNode({ label: event.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="element-description">Description</Label>
                  <textarea
                    id="element-description"
                    value={node.description ?? ""}
                    disabled={readOnly}
                    onChange={(event) =>
                      patchNode({ description: event.target.value || null })
                    }
                    className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="element-placeholder">Placeholder</Label>
                    <Input
                      id="element-placeholder"
                      value={
                        typeof node.attributes.placeholder === "string"
                          ? node.attributes.placeholder
                          : ""
                      }
                      disabled={readOnly}
                      onChange={(event) =>
                        patchAttributes({ placeholder: event.target.value })
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={node.attributes.required === true}
                      disabled={readOnly}
                      onChange={(event) =>
                        patchAttributes({ required: event.target.checked })
                      }
                    />
                    Required field
                  </label>
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                Containers can hold inputs and other containers. Use the Open
                action in the builder table to manage its contents.
              </p>
            )}

            {supportsOptions ? (
              <section className="space-y-3 border-t pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">Options</h3>
                    <p className="text-xs text-muted-foreground">
                      Configure the submitted value and visible label.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={readOnly}
                    onClick={addOption}
                  >
                    <PlusIcon />
                    Add option
                  </Button>
                </div>

                {(node.options ?? []).length === 0 ? (
                  <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    This input has no options yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(node.options ?? []).map((option, index) => (
                      <div
                        key={option.id}
                        className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor={`option-label-${option.id}`}>
                            Label {index + 1}
                          </Label>
                          <Input
                            id={`option-label-${option.id}`}
                            value={option.label}
                            disabled={readOnly}
                            onChange={(event) =>
                              patchNode({
                                options: replaceOption(
                                  node.options ?? [],
                                  option.id,
                                  { label: event.target.value },
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`option-value-${option.id}`}>
                            Value
                          </Label>
                          <Input
                            id={`option-value-${option.id}`}
                            value={option.value}
                            disabled={readOnly}
                            onChange={(event) =>
                              patchNode({
                                options: replaceOption(
                                  node.options ?? [],
                                  option.id,
                                  { value: event.target.value },
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="flex items-end gap-2 pb-0.5">
                          <label className="flex h-8 items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={option.disabled}
                              disabled={readOnly}
                              onChange={(event) =>
                                patchNode({
                                  options: replaceOption(
                                    node.options ?? [],
                                    option.id,
                                    { disabled: event.target.checked },
                                  ),
                                })
                              }
                            />
                            Disabled
                          </label>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            title="Remove option"
                            aria-label={`Remove option ${option.label}`}
                            disabled={readOnly}
                            onClick={() =>
                              patchNode({
                                options: (node.options ?? []).filter(
                                  (item) => item.id !== option.id,
                                ),
                              })
                            }
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : null}
          </div>
        ) : null}

        {node && !readOnly ? (
          <SheetFooter className="border-t">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onRemove(node.id)}
            >
              <Trash2Icon />
              Remove element
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
