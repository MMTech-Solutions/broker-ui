import { createJwfId } from "@/features/forms/lib/create-jwf-id";
import type {
  JwfDocument,
  JwfInputType,
  JwfNode,
} from "@/features/forms/types";

function formNode(document: JwfDocument) {
  return document.root.children?.find((node) => node.kind === "form");
}

function findNode(node: JwfNode, nodeId: string): JwfNode | undefined {
  if (node.id === nodeId) return node;

  for (const child of node.children ?? []) {
    const match = findNode(child, nodeId);
    if (match) return match;
  }

  return undefined;
}

function containerPath(
  nodes: JwfNode[],
  containerId: string,
  ancestors: JwfNode[] = [],
): JwfNode[] | undefined {
  for (const node of nodes) {
    if (node.kind !== "container") continue;

    const path = [...ancestors, node];
    if (node.id === containerId) return path;

    const nestedPath = containerPath(
      node.children ?? [],
      containerId,
      path,
    );
    if (nestedPath) return nestedPath;
  }

  return undefined;
}

export function findFormElement(
  document: JwfDocument,
  nodeId: string,
): JwfNode | undefined {
  const form = formNode(document);
  return form ? findNode(form, nodeId) : undefined;
}

export function formElements(
  document: JwfDocument,
  containerId: string | null = null,
): JwfNode[] {
  const form = formNode(document);
  if (!form) return [];

  if (!containerId) return form.children ?? [];
  const container = findNode(form, containerId);
  return container?.kind === "container" ? container.children ?? [] : [];
}

export function formContainerPath(
  document: JwfDocument,
  containerId: string | null,
): JwfNode[] {
  if (!containerId) return [];
  return containerPath(formNode(document)?.children ?? [], containerId) ?? [];
}

function editableForm(document: JwfDocument) {
  const root = structuredClone(document.root);
  const form = root.children?.find((node) => node.kind === "form");
  return { root, form };
}

function collectInputNames(node: JwfNode, names = new Set<string>()) {
  if (node.kind === "input" && node.name) names.add(node.name);
  for (const child of node.children ?? []) collectInputNames(child, names);
  return names;
}

function nextInputSuffix(form: JwfNode, kind: JwfInputType) {
  const names = collectInputNames(form);
  let suffix = names.size + 1;

  while (names.has(`${kind}_${suffix}`)) suffix += 1;
  return suffix;
}

export function addFormElement(
  document: JwfDocument,
  kind: JwfInputType | "container",
  containerId: string | null = null,
): JwfDocument {
  const { root, form } = editableForm(document);
  if (!form) return document;

  const parent = containerId ? findNode(form, containerId) : form;
  if (!parent || (parent.kind !== "form" && parent.kind !== "container")) {
    return document;
  }
  const parentDepth = containerId ? nodeDepth(form, containerId, 2) : 2;
  if (parentDepth === undefined || parentDepth + 1 > 32) return document;

  const children = parent.children ?? [];
  const position = children.length;
  const suffix =
    kind === "container" ? position + 1 : nextInputSuffix(form, kind);
  const node: JwfNode =
    kind === "container"
      ? {
          kind,
          id: createJwfId(),
          position,
          attributes: {},
          children: [],
        }
      : {
          kind: "input",
          id: createJwfId(),
          position,
          type: kind,
          name: `${kind}_${suffix}`,
          label: `${kind[0].toUpperCase()}${kind.slice(1)} ${suffix}`,
          description: null,
          attributes: {},
          configuration: {},
          options:
            kind === "select" || kind === "radio"
              ? [
                  {
                    id: createJwfId(),
                    value: "option_1",
                    label: "Option 1",
                    disabled: false,
                    attributes: {},
                  },
                ]
              : [],
          validation_profile_versions: [],
        };

  parent.children = [...children, node];
  return { ...document, root };
}

function removeNodeFromChildren(parent: JwfNode, nodeId: string): boolean {
  const children = parent.children ?? [];
  const nodeIndex = children.findIndex((node) => node.id === nodeId);

  if (nodeIndex >= 0) {
    parent.children = children
      .filter((node) => node.id !== nodeId)
      .map((node, position) => ({ ...node, position }));
    return true;
  }

  return children.some((node) => removeNodeFromChildren(node, nodeId));
}

type NodeLocation = {
  parent: JwfNode;
  node: JwfNode;
};

function findNodeLocation(
  parent: JwfNode,
  nodeId: string,
): NodeLocation | undefined {
  for (const node of parent.children ?? []) {
    if (node.id === nodeId) return { parent, node };

    const nested = findNodeLocation(node, nodeId);
    if (nested) return nested;
  }

  return undefined;
}

function containsNode(node: JwfNode, nodeId: string): boolean {
  return (
    node.id === nodeId ||
    (node.children ?? []).some((child) => containsNode(child, nodeId))
  );
}

function nodeDepth(
  node: JwfNode,
  nodeId: string,
  depth: number,
): number | undefined {
  if (node.id === nodeId) return depth;

  for (const child of node.children ?? []) {
    const match = nodeDepth(child, nodeId, depth + 1);
    if (match !== undefined) return match;
  }

  return undefined;
}

function nodeHeight(node: JwfNode): number {
  const childHeights = (node.children ?? []).map(nodeHeight);
  return 1 + (childHeights.length > 0 ? Math.max(...childHeights) : 0);
}

function normalizedChildren(children: JwfNode[]) {
  return children.map((node, position) => ({ ...node, position }));
}

export function moveFormElement(
  document: JwfDocument,
  nodeId: string,
  targetContainerId: string | null,
): JwfDocument {
  const { root, form } = editableForm(document);
  if (!form) return document;

  const source = findNodeLocation(form, nodeId);
  if (!source) return document;

  if (
    targetContainerId &&
    containsNode(source.node, targetContainerId)
  ) {
    return document;
  }

  const target = targetContainerId
    ? findNode(form, targetContainerId)
    : form;
  if (!target || (target.kind !== "form" && target.kind !== "container")) {
    return document;
  }
  if (source.parent.id === target.id) return document;

  const targetDepth = targetContainerId
    ? nodeDepth(form, targetContainerId, 2)
    : 2;
  if (
    targetDepth === undefined ||
    targetDepth + nodeHeight(source.node) > 32
  ) {
    return document;
  }

  source.parent.children = normalizedChildren(
    (source.parent.children ?? []).filter((node) => node.id !== nodeId),
  );
  const attachedTarget = targetContainerId
    ? findNode(form, targetContainerId)
    : form;
  if (
    !attachedTarget ||
    (attachedTarget.kind !== "form" && attachedTarget.kind !== "container")
  ) {
    return document;
  }
  attachedTarget.children = normalizedChildren([
    ...(attachedTarget.children ?? []),
    source.node,
  ]);

  return { ...document, root };
}

export function removeFormElement(
  document: JwfDocument,
  nodeId: string,
): JwfDocument {
  const { root, form } = editableForm(document);
  if (!form || !removeNodeFromChildren(form, nodeId)) return document;

  return { ...document, root };
}

export function updateFormElement(
  document: JwfDocument,
  nodeId: string,
  update: (node: JwfNode) => void,
): JwfDocument {
  const { root, form } = editableForm(document);
  const node = form ? findNode(form, nodeId) : undefined;
  if (!node) return document;

  update(node);
  return { ...document, root };
}

function reorderChildren(
  parent: JwfNode,
  sourceId: string,
  targetId: string,
): boolean {
  const children = parent.children ?? [];
  const sourceIndex = children.findIndex((node) => node.id === sourceId);
  const targetIndex = children.findIndex((node) => node.id === targetId);

  if (sourceIndex >= 0 && targetIndex >= 0) {
    const reordered = [...children];
    const [source] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, source);
    parent.children = reordered.map((node, position) => ({
      ...node,
      position,
    }));
    return true;
  }

  return children.some((node) => reorderChildren(node, sourceId, targetId));
}

export function reorderFormElement(
  document: JwfDocument,
  sourceId: string,
  targetId: string,
): JwfDocument {
  if (sourceId === targetId) return document;

  const { root, form } = editableForm(document);
  if (!form || !reorderChildren(form, sourceId, targetId)) return document;

  return { ...document, root };
}
