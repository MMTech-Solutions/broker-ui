import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ApiErrorAlertProps = {
  title?: string;
  message: string;
};

export function ApiErrorAlert({
  title = "Something went wrong",
  message,
}: ApiErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
