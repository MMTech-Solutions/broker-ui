import type { JwfDocument, JwfNode } from "@/features/forms/types";
import { cn } from "@/lib/utils";

type JwfFormPreviewProps = {
  document: JwfDocument;
};

function stringAttribute(node: JwfNode, key: string) {
  const value = node.attributes[key];
  return typeof value === "string" ? value : undefined;
}

function InputPreview({ node }: { node: JwfNode }) {
  if (node.kind !== "input" || !node.type) return null;

  const label = node.label || node.name || "Untitled field";
  const placeholder = stringAttribute(node, "placeholder");
  const required = node.attributes.required === true;

  if (node.type === "hidden") {
    return <input type="hidden" name={node.name} />;
  }

  if (node.type === "checkbox") {
    return (
      <div className="col-span-full space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name={node.name} required={required} />
          {label}
        </label>
        {node.description ? (
          <p className="text-xs text-muted-foreground">{node.description}</p>
        ) : null}
      </div>
    );
  }

  if (node.type === "radio") {
    return (
      <fieldset className="col-span-full space-y-2">
        <legend className="text-sm font-medium">{label}</legend>
        {node.description ? (
          <p className="text-xs text-muted-foreground">{node.description}</p>
        ) : null}
        <div className="space-y-2">
          {(node.options ?? []).map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={node.name}
                value={option.value}
                disabled={option.disabled}
                required={required}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div
      className={cn(
        "space-y-1.5",
        node.type === "textarea" && "col-span-full",
      )}
    >
      <label htmlFor={node.id} className="text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
      {node.description ? (
        <p className="text-xs text-muted-foreground">{node.description}</p>
      ) : null}
      {node.type === "textarea" ? (
        <textarea
          id={node.id}
          name={node.name}
          placeholder={placeholder}
          required={required}
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ) : node.type === "select" ? (
        <select
          id={node.id}
          name={node.name}
          required={required}
          defaultValue=""
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            {placeholder ?? "Select an option"}
          </option>
          {(node.options ?? []).map((option) => (
            <option
              key={option.id}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={node.id}
          type={node.type}
          name={node.name}
          placeholder={placeholder}
          required={required}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      )}
    </div>
  );
}

function NodePreview({ node }: { node: JwfNode }) {
  if (node.kind === "container") {
    return (
      <div className="col-span-full grid gap-4 rounded-xl border p-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))]">
        {(node.children ?? []).map((child) => (
          <NodePreview key={child.id} node={child} />
        ))}
      </div>
    );
  }

  return <InputPreview node={node} />;
}

export function JwfFormPreview({ document }: JwfFormPreviewProps) {
  const form = document.root.children?.find((node) => node.kind === "form");
  const children = form?.children ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border bg-background p-6 shadow-sm">
      {children.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Add fields in the builder to see the form preview.
        </div>
      ) : (
        <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
          {children.map((node) => (
            <NodePreview key={node.id} node={node} />
          ))}
          <button
            type="submit"
            className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
