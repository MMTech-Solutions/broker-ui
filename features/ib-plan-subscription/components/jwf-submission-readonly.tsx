"use client";

import type { JwfNode } from "@/features/forms/types";
import type { IbPlanSubscriptionFormSubmission } from "@/features/ib-plan-subscription/types";

function displayValue(node: JwfNode, answer: IbPlanSubscriptionFormSubmission["answers"][number] | undefined): string {
  if (!answer) return "—";
  if (answer.sensitive) return "••••••••";
  if (answer.value === null || answer.value === "") return "—";
  if (typeof answer.value === "boolean") return answer.value ? "Yes" : "No";
  const option = node.options?.find((entry) => entry.value === String(answer.value));
  return option?.label ?? String(answer.value);
}

function findForm(node: JwfNode): JwfNode | undefined {
  if (node.kind === "form") return node;
  for (const child of node.children ?? []) {
    const found = findForm(child);
    if (found) return found;
  }
  return undefined;
}

function ReadonlyNode({ node, answers }: { node: JwfNode; answers: Map<string, IbPlanSubscriptionFormSubmission["answers"][number]> }) {
  if (node.kind === "container") {
    return <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">{(node.children ?? []).map((child) => <ReadonlyNode key={child.id} node={child} answers={answers} />)}</div>;
  }
  if (node.kind !== "input") return null;
  return <div className={node.type === "textarea" || node.type === "radio" ? "sm:col-span-2" : ""}>
    <dt className="text-xs text-muted-foreground">{node.label || node.name || "Untitled field"}</dt>
    <dd className="mt-1 whitespace-pre-wrap text-sm">{displayValue(node, answers.get(node.id))}</dd>
  </div>;
}

export function JwfSubmissionReadonly({ submission }: { submission: IbPlanSubscriptionFormSubmission }) {
  const form = findForm(submission.document.root);
  const answers = new Map(submission.answers.map((answer) => [answer.input_id, answer]));
  return <div className="space-y-3 rounded-lg border p-4">
    <div><p className="text-sm font-medium">Submitted form · {submission.template_name ?? "Form"}</p><p className="text-xs text-muted-foreground">Version {submission.version_number} · {new Date(submission.submitted_at).toLocaleString()}</p></div>
    <dl className="grid gap-4 sm:grid-cols-2">{(form?.children ?? []).map((node) => <ReadonlyNode key={node.id} node={node} answers={answers} />)}</dl>
  </div>;
}
