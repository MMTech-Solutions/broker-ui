export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function subscriptionStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "active":
      return "Active";
    case "denied":
      return "Denied";
    default:
      return status;
  }
}

export function subscriptionStatusVariant(
  status: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active":
      return "default";
    case "pending":
      return "outline";
    case "denied":
      return "destructive";
    default:
      return "secondary";
  }
}
