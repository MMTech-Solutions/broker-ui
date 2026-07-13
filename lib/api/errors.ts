import {
  extractValidationMessages,
  parseBrokerErrorPayload,
  type BrokerErrorDetails,
  type ParsedBrokerError,
} from "@/lib/api/parse-broker-error";

export class BrokerApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: BrokerErrorDetails;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      details?: BrokerErrorDetails;
    },
  ) {
    super(message);
    this.name = "BrokerApiError";
    this.status = options.status;
    this.code = options.code ?? "BROKER_API_ERROR";
    this.details = options.details ?? {};
  }

  static fromResponse(
    status: number,
    payload: unknown,
    fallbackMessage = "Broker API request failed.",
  ): BrokerApiError {
    const parsed = parseBrokerErrorPayload(payload, fallbackMessage);

    return new BrokerApiError(parsed.message, {
      status,
      code: parsed.code,
      details: parsed.details,
    });
  }
}

export function formatBrokerApiError(error: unknown): string {
  if (error instanceof BrokerApiError) {
    const fieldMessages = extractValidationMessages(error.details);

    if (fieldMessages.length > 0) {
      return fieldMessages.join(" ");
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

export type { ParsedBrokerError };
