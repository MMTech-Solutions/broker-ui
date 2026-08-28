"use client";

import {
  Fragment,
  type DragEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  EyeIcon,
  FolderInputIcon,
  FolderOpenIcon,
  GripVerticalIcon,
  PencilIcon,
  SaveIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getForm,
  getFormVersion,
  publishFormVersion,
  saveFormDraft,
} from "@/features/forms/api";
import { FormElementEditorSheet } from "@/features/forms/components/form-element-editor-sheet";
import { JwfFormPreview } from "@/features/forms/components/jwf-form-preview";
import {
  addFormElement,
  findFormElement,
  formContainerPath,
  formElements,
  moveFormElement,
  removeFormElement,
  reorderFormElement,
  updateFormElement,
} from "@/features/forms/lib/form-document";
import {
  FORM_INPUT_TYPES,
  type FormTemplate,
  type FormVersion,
  type JwfDocument,
  type JwfInputType,
  type JwfNode,
} from "@/features/forms/types";
import { formatBrokerApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const PALETTE_MIME = "application/x-jwf-palette";
const NODE_MIME = "application/x-jwf-node";
const ROOT_DROP_TARGET = "form-root";

type BuilderTab = "builder" | "preview";

type FormBuilderViewProps = {
  templateId: string;
  versionId: string;
  initialTab?: BuilderTab;
  forceReadOnly?: boolean;
};

function isPaletteType(value: string): value is JwfInputType | "container" {
  return FORM_INPUT_TYPES.some((item) => item.value === value);
}

function elementTitle(node: JwfNode) {
  if (node.kind === "container") return `Container ${node.position + 1}`;
  return node.label || node.name || "Untitled input";
}

function optionsSummary(node: JwfNode) {
  if (node.kind === "container") {
    const count = node.children?.length ?? 0;
    return `${count} ${count === 1 ? "element" : "elements"}`;
  }

  if (
    node.kind !== "input" ||
    (node.type !== "select" && node.type !== "radio")
  ) {
    return "—";
  }

  const options = node.options ?? [];
  if (options.length === 0) return "No options";

  const labels = options
    .slice(0, 2)
    .map((option) => option.label)
    .join(", ");
  return options.length > 2 ? `${labels} +${options.length - 2}` : labels;
}

export function FormBuilderView({
  templateId,
  versionId,
  initialTab = "builder",
  forceReadOnly = false,
}: FormBuilderViewProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [version, setVersion] = useState<FormVersion | null>(null);
  const [formDocument, setFormDocument] = useState<JwfDocument | null>(null);
  const [activeTab, setActiveTab] = useState<BuilderTab>(initialTab);
  const [activeContainerId, setActiveContainerId] = useState<string | null>(
    null,
  );
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readOnly = forceReadOnly || version?.state !== "draft";
  const elements = useMemo(
    () =>
      formDocument ? formElements(formDocument, activeContainerId) : [],
    [activeContainerId, formDocument],
  );
  const activePath = useMemo(
    () =>
      formDocument
        ? formContainerPath(formDocument, activeContainerId)
        : [],
    [activeContainerId, formDocument],
  );
  const selectedNode =
    formDocument && selectedNodeId
      ? findFormElement(formDocument, selectedNodeId) ?? null
      : null;

  useEffect(() => {
    let cancelled = false;

    Promise.all([getForm(templateId), getFormVersion(templateId, versionId)])
      .then(([templateResponse, versionResponse]) => {
        if (cancelled) return;

        if (!versionResponse.data.document) {
          setError("This form version does not contain a document.");
          return;
        }

        setTemplate(templateResponse.data);
        setVersion(versionResponse.data);
        setFormDocument(versionResponse.data.document);
        setActiveContainerId(null);
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
  }, [templateId, versionId]);

  useEffect(() => {
    if (!dirty) return;

    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [dirty]);

  function changeDocument(
    update: (current: JwfDocument) => JwfDocument,
  ) {
    if (readOnly) return;
    setFormDocument((current) => (current ? update(current) : current));
    setDirty(true);
  }

  function addElement(kind: JwfInputType | "container") {
    changeDocument((current) =>
      addFormElement(current, kind, activeContainerId),
    );
  }

  function removeElement(nodeId: string) {
    const node = formDocument
      ? findFormElement(formDocument, nodeId)
      : undefined;
    if (
      node?.kind === "container" &&
      (node.children?.length ?? 0) > 0 &&
      !window.confirm(
        "Remove this container and every element inside it?",
      )
    ) {
      return;
    }

    changeDocument((current) => removeFormElement(current, nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }

  function openContainer(nodeId: string) {
    setSelectedNodeId(null);
    setActiveContainerId(nodeId);
  }

  function dropIntoContainer(
    event: DragEvent<HTMLElement>,
    containerId: string | null,
  ) {
    if (readOnly) return;

    event.preventDefault();
    event.stopPropagation();

    const sourceId = event.dataTransfer.getData(NODE_MIME);
    const paletteType = event.dataTransfer.getData(PALETTE_MIME);

    if (sourceId && sourceId !== containerId) {
      if (containerId === activeContainerId) {
        setDropTargetId(null);
        return;
      }
      changeDocument((current) =>
        moveFormElement(current, sourceId, containerId),
      );
    } else if (isPaletteType(paletteType)) {
      changeDocument((current) =>
        addFormElement(current, paletteType, containerId),
      );
    }

    setDropTargetId(null);
  }

  function updateElement(node: JwfNode) {
    changeDocument((current) =>
      updateFormElement(current, node.id, (target) => {
        Object.assign(target, node);
      }),
    );
  }

  async function save() {
    if (!formDocument || !version || readOnly) return false;

    setSaving(true);
    try {
      const response = await saveFormDraft(
        templateId,
        version.id,
        formDocument,
      );
      setVersion(response.data);
      if (response.data.document) setFormDocument(response.data.document);
      setDirty(false);
      setError(null);
      return true;
    } catch (cause) {
      setError(formatBrokerApiError(cause));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!formDocument || !version || readOnly) return;

    setSaving(true);
    try {
      if (dirty) {
        await saveFormDraft(templateId, version.id, formDocument);
      }
      await publishFormVersion(templateId, version.id);
      setDirty(false);
      router.push("/forms");
    } catch (cause) {
      setError(formatBrokerApiError(cause));
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    if (dirty && !window.confirm("Discard the unsaved form changes?")) return;
    router.push("/forms");
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
        Loading form builder…
      </div>
    );
  }

  if (!formDocument || !version) {
    return (
      <div className="p-4">
        <ApiErrorAlert
          title="Form builder"
          message={error ?? "The form version could not be loaded."}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            size="icon"
            variant="outline"
            title="Back to forms"
            onClick={goBack}
          >
            <ArrowLeftIcon />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold">
                {template?.name ?? "Form builder"}
              </h1>
              <Badge variant={readOnly ? "secondary" : "outline"}>
                v{version.number} · {version.state}
              </Badge>
              {dirty ? <Badge variant="secondary">Unsaved</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Build the JWF document and inspect its live preview.
            </p>
          </div>
        </div>

        {!readOnly ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving || !dirty}
              onClick={() => void save()}
            >
              <SaveIcon />
              {saving ? "Saving…" : "Save draft"}
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void publish()}
            >
              <SendIcon />
              Publish
            </Button>
          </div>
        ) : null}
      </div>

      {error ? <ApiErrorAlert title="Form builder" message={error} /> : null}

      <div className="grid items-start gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
        <Card className="xl:sticky xl:top-4">
          <CardHeader>
            <CardTitle>Elements</CardTitle>
            <CardDescription>
              Drag or click to add an element to the current level.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {FORM_INPUT_TYPES.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant="outline"
                className="h-auto justify-start px-3 py-2.5"
                disabled={readOnly}
                draggable={!readOnly}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "copy";
                  event.dataTransfer.setData(PALETTE_MIME, item.value);
                }}
                onDragEnd={() => setDropTargetId(null)}
                onClick={() => addElement(item.value)}
              >
                <GripVerticalIcon className="text-muted-foreground" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="border-b">
            <div
              role="tablist"
              aria-label="Form builder views"
              className="flex w-fit gap-1 rounded-lg border bg-muted/40 p-1"
            >
              <Button
                type="button"
                size="sm"
                variant={activeTab === "builder" ? "default" : "ghost"}
                role="tab"
                aria-selected={activeTab === "builder"}
                onClick={() => setActiveTab("builder")}
              >
                Builder
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeTab === "preview" ? "default" : "ghost"}
                role="tab"
                aria-selected={activeTab === "preview"}
                onClick={() => setActiveTab("preview")}
              >
                Preview
              </Button>
            </div>
          </CardHeader>

          {activeTab === "builder" ? (
            <CardContent
              className="px-0"
              onDragOver={(event) => {
                if (!readOnly) event.preventDefault();
              }}
              onDrop={(event) => {
                if (readOnly) return;
                const type = event.dataTransfer.getData(PALETTE_MIME);
                if (!isPaletteType(type)) return;
                event.preventDefault();
                addElement(type);
              }}
            >
              <div className="border-b px-4 py-3">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem
                      className={cn(
                        "rounded-md px-1.5 py-1 transition-colors",
                        dropTargetId === ROOT_DROP_TARGET &&
                          "bg-primary text-primary-foreground",
                      )}
                      onDragOver={(event) => {
                        if (readOnly || !activeContainerId) return;
                        event.preventDefault();
                        event.stopPropagation();
                        setDropTargetId(ROOT_DROP_TARGET);
                      }}
                      onDragLeave={() => setDropTargetId(null)}
                      onDrop={(event) => dropIntoContainer(event, null)}
                    >
                      {activeContainerId ? (
                        <BreadcrumbLink
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            setActiveContainerId(null);
                          }}
                        >
                          Form root
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>Form root</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {activePath.map((container, index) => {
                      const isCurrent = index === activePath.length - 1;

                      return (
                        <Fragment key={container.id}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem
                            className={cn(
                              "rounded-md px-1.5 py-1 transition-colors",
                              dropTargetId === container.id &&
                                "bg-primary text-primary-foreground",
                            )}
                            onDragOver={(event) => {
                              if (readOnly || isCurrent) return;
                              event.preventDefault();
                              event.stopPropagation();
                              setDropTargetId(container.id);
                            }}
                            onDragLeave={() => setDropTargetId(null)}
                            onDrop={(event) =>
                              dropIntoContainer(event, container.id)
                            }
                          >
                            {isCurrent ? (
                              <BreadcrumbPage>
                                {elementTitle(container)}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                href="#"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setActiveContainerId(container.id);
                                }}
                              >
                                {elementTitle(container)}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </Fragment>
                      );
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="border-b px-4 py-3 text-sm text-muted-foreground">
                {readOnly
                  ? "This version is read-only."
                  : "Drag rows to reorder, drop inside a container to nest, or drop on a breadcrumb to move up."}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" aria-label="Order" />
                    <TableHead>Type</TableHead>
                    <TableHead>Technical name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="m-2 rounded-lg border border-dashed py-14 text-center text-sm text-muted-foreground">
                          {activeContainerId
                            ? "This container is empty. Drag an element here."
                            : "Drag your first element here."}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    elements.map((node) => (
                      <TableRow
                        key={node.id}
                        draggable={!readOnly}
                        className={readOnly ? undefined : "cursor-grab"}
                        onDragStart={(event) => {
                          if (readOnly) return;
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData(NODE_MIME, node.id);
                        }}
                        onDragEnd={() => setDropTargetId(null)}
                        onDragOver={(event) => {
                          if (!readOnly) event.preventDefault();
                        }}
                        onDrop={(event) => {
                          const sourceId = event.dataTransfer.getData(NODE_MIME);
                          if (readOnly || !sourceId) return;
                          event.preventDefault();
                          event.stopPropagation();
                          changeDocument((current) =>
                            reorderFormElement(current, sourceId, node.id),
                          );
                        }}
                        onDoubleClick={() => {
                          if (node.kind === "container") {
                            openContainer(node.id);
                          }
                        }}
                      >
                        <TableCell>
                          <GripVerticalIcon className="size-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {node.kind === "input" ? node.type : node.kind}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {node.name ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-56 truncate">
                          {elementTitle(node)}
                        </TableCell>
                        <TableCell className="max-w-56 truncate text-muted-foreground">
                          {optionsSummary(node)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {node.kind === "container" ? (
                              <>
                                {!readOnly ? (
                                  <div
                                    className={cn(
                                      "inline-flex h-7 items-center gap-1 rounded-md border border-dashed px-2 text-xs font-medium transition-colors",
                                      dropTargetId === node.id
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "text-muted-foreground",
                                    )}
                                    title={`Drop an element inside ${elementTitle(node)}`}
                                    onDragOver={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setDropTargetId(node.id);
                                    }}
                                    onDragLeave={() => setDropTargetId(null)}
                                    onDrop={(event) =>
                                      dropIntoContainer(event, node.id)
                                    }
                                  >
                                    <FolderInputIcon className="size-3.5" />
                                    Drop inside
                                  </div>
                                ) : null}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  title={`Open ${elementTitle(node)}`}
                                  onClick={() => openContainer(node.id)}
                                >
                                  <FolderOpenIcon />
                                  Open
                                </Button>
                              </>
                            ) : null}
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              title={readOnly ? "View element" : "Edit element"}
                              onClick={() => setSelectedNodeId(node.id)}
                            >
                              {readOnly ? <EyeIcon /> : <PencilIcon />}
                            </Button>
                            {!readOnly ? (
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                title="Remove element"
                                aria-label={`Remove ${elementTitle(node)}`}
                                onClick={() => removeElement(node.id)}
                              >
                                <Trash2Icon />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          ) : (
            <CardContent className="bg-muted/20 py-6">
              <JwfFormPreview document={formDocument} />
            </CardContent>
          )}
        </Card>
      </div>

      <FormElementEditorSheet
        node={selectedNode}
        readOnly={readOnly}
        onOpenChange={(open) => {
          if (!open) setSelectedNodeId(null);
        }}
        onChange={updateElement}
        onRemove={removeElement}
      />
    </div>
  );
}
