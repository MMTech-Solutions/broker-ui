export type AuthArea = "admin" | "client";

export type IamTokenBundle = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

export type IamLoginData = IamTokenBundle & {
  requires_2fa?: boolean;
  temp_token?: string;
  method?: string;
};

export type IamEnvelope<T> = {
  success?: boolean;
  data?: T;
  meta?: { message?: string };
};

export type SessionPayload = {
  user_id: string;
  email?: string;
  name?: string;
  access_token: string;
  refresh_token?: string;
  /** Absolute ms when the httpOnly cookie expires. */
  expires_at: number;
  /** Absolute ms when the access token should be refreshed. */
  access_expires_at: number;
};

export type LoginFormState =
  | { error: string }
  | { requires_2fa: true; method?: string };

export type LoginFormActionState = LoginFormState | null;
