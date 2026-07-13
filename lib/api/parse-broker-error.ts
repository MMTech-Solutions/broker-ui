export type BrokerErrorDetails = Record<string, unknown> | unknown[];

export type ParsedBrokerError = {
  message: string;
  code: string;
  details: BrokerErrorDetails;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseBrokerErrorPayload(
  payload: unknown,
  fallbackMessage = "Broker API request failed.",
): ParsedBrokerError {
  if (!isRecord(payload)) {
    return {
      message: fallbackMessage,
      code: "BROKER_API_ERROR",
      details: {},
    };
  }

  if (payload.success === false && isRecord(payload.error)) {
    return {
      message:
        typeof payload.message === "string" ? payload.message : fallbackMessage,
      code:
        typeof payload.error.code === "string"
          ? payload.error.code
          : "BROKER_API_ERROR",
      details: (payload.error.details as BrokerErrorDetails) ?? {},
    };
  }

  if (isRecord(payload.errors)) {
    const details = payload.errors as Record<string, unknown>;
    const fieldMessages = extractValidationMessages(details);

    return {
      message:
        fieldMessages[0] ??
        (typeof payload.message === "string"
          ? payload.message
          : fallbackMessage),
      code: "VALIDATION_ERROR",
      details,
    };
  }

  if (typeof payload.message === "string") {
    return {
      message: payload.message,
      code: "BROKER_API_ERROR",
      details: {},
    };
  }

  return {
    message: fallbackMessage,
    code: "BROKER_API_ERROR",
    details: {},
  };
}

export function extractValidationMessages(
  details: BrokerErrorDetails,
): string[] {
  if (!isRecord(details)) {
    return [];
  }

  return Object.entries(details).flatMap(([field, value]) => {
    const messages = Array.isArray(value) ? value : [value];

    return messages
      .map((message) => String(message))
      .filter(Boolean)
      .map((message) => humanizeValidationMessage(field, message));
  });
}

function humanizeValidationMessage(field: string, message: string): string {
  if (field === "name" && /already been taken/i.test(message)) {
    return "A platform with this name already exists.";
  }

  return message;
}
