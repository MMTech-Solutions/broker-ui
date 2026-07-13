import { cn } from "@/lib/utils";

type HtmlContentProps = {
  html: string;
  className?: string;
};

export function HtmlContent({ html, className }: HtmlContentProps) {
  if (!html.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-foreground dark:prose-invert",
        "[&_a]:text-primary [&_a]:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
