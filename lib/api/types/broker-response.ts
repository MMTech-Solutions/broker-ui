export type BrokerPaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type BrokerSuccessMeta = {
  message?: string;
  pagination?: BrokerPaginationMeta;
  filters?: Record<string, unknown>;
  thresholds_warning_message?: string;
  configuration_warnings?: string[];
  warnings?: string[];
};

export type BrokerSuccessResponse<T> = {
  success: true;
  data: T;
  meta: BrokerSuccessMeta;
};

export type BrokerErrorResponse = {
  success: false;
  message: string;
  error: {
    code: string;
    details: Record<string, unknown> | unknown[];
  };
};

export type LaravelValidationErrorResponse = {
  message: string;
  errors: Record<string, string[]>;
};

export type BrokerResponse<T> = BrokerSuccessResponse<T> | BrokerErrorResponse;

export function isBrokerSuccessResponse<T>(
  response: unknown,
): response is BrokerSuccessResponse<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as BrokerSuccessResponse<T>).success === true
  );
}
