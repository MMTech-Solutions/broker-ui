export type ContestStatus =
  | "draft"
  | "upcoming"
  | "active"
  | "finished"
  | "cancelled";

export type ContestAwardType = "money" | "benefit";

export type ContestServerGroup = {
  id: string;
  /** Platform identity (admin). Client only gets display label here. */
  name: string;
  /** Present for admin only. */
  meta_name?: string | null;
  currency: string;
  currency_precision?: number;
};

export type Contest = {
  id: string;
  name: string;
  min_balance_threshold: number;
  max_balance_threshold: number;
  entry_fee: number;
  is_protected: boolean;
  starts_at: string | null;
  ends_at: string | null;
  linked_ib_user_id: string | null;
  server_group_id: string;
  status: ContestStatus;
  start_reminder_notified_at?: string | null;
  closing_alert_notified_at?: string | null;
  subscriptions_count?: number;
  awards_count?: number;
  bans_count?: number;
  server_group?: ContestServerGroup | null;
  awards?: ContestAward[];
  conditions?: ContestCondition[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContestAward = {
  id: string;
  name: string;
  award_type: ContestAwardType;
  assignments_count?: number;
  position?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContestCondition = {
  id: string;
  title: string;
  body: string;
  assignments_count?: number;
  is_visible?: boolean;
  sort_order?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContestSubscriptionAccount = {
  id: string;
  external_trader_id: string;
  server_group_id: string;
  current_balance: number;
  current_equity: number;
};

/** Owner payload from broker API (post user-enrichment). */
export type ContestUserOwner = {
  /** Present for admin; omitted on public client payloads. */
  id?: string | null;
  /** Present for admin; omitted on public client payloads. */
  email?: string | null;
  name: string;
};

export type ContestSubscriptionContest = {
  id: string;
  name: string;
  status: ContestStatus;
};

export type ContestSubscription = {
  id: string;
  contest_id: string;
  /** Present for admin participants list. */
  contest?: ContestSubscriptionContest | null;
  user: ContestUserOwner;
  account_id: string;
  /** Present for admin; omitted on public client payloads. */
  entry_fee_charged?: number;
  balance_snapshot: number;
  performance_index: number | null;
  subscribed_at: string | null;
  /** Present for admin; omitted on public client payloads. */
  unsubscribed_at?: string | null;
  rank?: number;
  account?: ContestSubscriptionAccount | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContestParticipantSortBy =
  | "performance_index"
  | "balance_snapshot"
  | "entry_fee_charged"
  | "subscribed_at"
  | "created_at"
  | "updated_at"
  | "user.id"
  | "user.name"
  | "user.email"
  | "contest.id"
  | "contest.name"
  | "contest.status";

export type ContestParticipantSortDirection = "asc" | "desc";

export type ContestParticipantListFilters = {
  contest_id?: string;
  contest_name?: string;
  contest_status?: ContestStatus;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  external_trader_id?: string;
  performance_index?: number;
  balance_snapshot?: number;
  entry_fee_charged?: number;
  sort_by?: ContestParticipantSortBy;
  sort_direction?: ContestParticipantSortDirection;
  page?: number;
  per_page?: number;
};

export type ContestParticipantFilterFormState = {
  contest_id: string;
  contest_name: string;
  contest_status: ContestStatus | "";
  user_id: string;
  user_name: string;
  user_email: string;
  external_trader_id: string;
  performance_index: string;
  balance_snapshot: string;
  entry_fee_charged: string;
};

export const EMPTY_CONTEST_PARTICIPANT_FILTERS: ContestParticipantFilterFormState =
  {
    contest_id: "",
    contest_name: "",
    contest_status: "",
    user_id: "",
    user_name: "",
    user_email: "",
    external_trader_id: "",
    performance_index: "",
    balance_snapshot: "",
    entry_fee_charged: "",
  };

export type ContestBanAccount = {
  id: string;
  external_trader_id: string;
};

export type ContestBan = {
  id: string;
  contest_id: string;
  user: ContestUserOwner;
  account_id: string;
  reason: string;
  banned_by_user_id: string;
  banned_at: string | null;
  reverted_at: string | null;
  reverted_by_user_id: string | null;
  is_active: boolean;
  account?: ContestBanAccount | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContestBanSortBy =
  | "banned_at"
  | "created_at"
  | "updated_at"
  | "reason"
  | "user.id"
  | "user.name"
  | "user.email";

export type ContestBanSortDirection = "asc" | "desc";

export type ContestBanListFilters = {
  user_id?: string;
  user_name?: string;
  user_email?: string;
  external_trader_id?: string;
  reason?: string;
  is_active?: boolean;
  sort_by?: ContestBanSortBy;
  sort_direction?: ContestBanSortDirection;
  page?: number;
  per_page?: number;
};

export type ContestBanFilterFormState = {
  user_id: string;
  user_name: string;
  user_email: string;
  external_trader_id: string;
  reason: string;
  is_active: "" | "true" | "false";
};

export const EMPTY_CONTEST_BAN_FILTERS: ContestBanFilterFormState = {
  user_id: "",
  user_name: "",
  user_email: "",
  external_trader_id: "",
  reason: "",
  is_active: "",
};

export type CreateContestBanInput = {
  external_user_id: string;
  account_id: string;
  reason: string;
};

export function resolveContestSubscriptionOwner(
  subscription: ContestSubscription,
): ContestUserOwner {
  return {
    id: subscription.user?.id ?? "",
    email: subscription.user?.email ?? null,
    name: subscription.user?.name ?? "",
  };
}

export function resolveContestBanOwner(ban: ContestBan): ContestUserOwner {
  return {
    id: ban.user?.id ?? "",
    email: ban.user?.email ?? null,
    name: ban.user?.name ?? "",
  };
}

export type ContestGlobalSettings = {
  banner_image_url: string | null;
  help_html: string | null;
  start_reminder_days: number | null;
  closing_alert_days: number | null;
};

export type EligibleIntroducingBroker = {
  external_user_id: string;
};

export type ContestFormCatalogServerGroup = {
  id: string;
  name: string;
  label: string;
  tradingServerId: string;
  tradingServerLabel: string;
  currency?: string;
  currency_precision?: number;
};

export type ContestListFilters = {
  name?: string;
  status?: ContestStatus;
  server_group_id?: string;
  linked_ib_user_id?: string;
  page?: number;
  per_page?: number;
};

export type ContestConditionListFilters = {
  title?: string;
  page?: number;
  per_page?: number;
};

export type CreateContestInput = {
  name: string;
  min_balance_threshold: number;
  max_balance_threshold: number;
  entry_fee: number;
  access_code?: string | null;
  starts_at: string;
  ends_at: string;
  linked_ib_user_id?: string | null;
  server_group_id: string;
};

export type UpdateContestInput = {
  name?: string;
  min_balance_threshold?: number;
  max_balance_threshold?: number;
  entry_fee?: number;
  access_code?: string | null;
  starts_at?: string;
  ends_at?: string;
  linked_ib_user_id?: string | null;
  server_group_id?: string;
};

export type ContestAwardListFilters = {
  name?: string;
  page?: number;
  per_page?: number;
};

export type CreateContestAwardInput = {
  name: string;
  award_type: ContestAwardType;
};

export type UpdateContestAwardInput = {
  name?: string;
  award_type?: ContestAwardType;
};

export type AssignContestAwardInput = {
  position: number;
};

export type UpdateContestAwardAssignmentInput = {
  position?: number;
};

export type CreateContestConditionInput = {
  title: string;
  body: string;
};

export type UpdateContestConditionInput = {
  title?: string;
  body?: string;
};

export type AssignContestConditionInput = {
  is_visible?: boolean;
  sort_order?: number;
};

export type UpdateContestConditionAssignmentInput = {
  is_visible?: boolean;
  sort_order?: number;
};

export type UpdateContestGlobalSettingsInput = {
  banner?: File | null;
  remove_banner?: boolean;
  help_html?: string | null;
  start_reminder_days?: number | null;
  closing_alert_days?: number | null;
};

export const CONTEST_STATUSES: { value: ContestStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "finished", label: "Finished" },
  { value: "cancelled", label: "Cancelled" },
];

export const CONTEST_AWARD_TYPES: { value: ContestAwardType; label: string }[] =
  [
    { value: "money", label: "Money" },
    { value: "benefit", label: "Benefit" },
  ];
