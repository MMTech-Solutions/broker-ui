export type ContestStatus =
  | "draft"
  | "upcoming"
  | "active"
  | "finished"
  | "cancelled";

export type ContestAwardType = "money" | "benefit";

export type ContestServerGroup = {
  id: string;
  name: string;
  currency: string;
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

export type ContestSubscription = {
  id: string;
  contest_id: string;
  external_user_id: string;
  account_id: string;
  entry_fee_charged: number;
  balance_snapshot: number;
  performance_index: number | null;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  rank?: number;
  account?: ContestSubscriptionAccount | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ContestParticipantListFilters = {
  page?: number;
  per_page?: number;
};

export type ContestBanAccount = {
  id: string;
  external_trader_id: string;
};

export type ContestBan = {
  id: string;
  contest_id: string;
  external_user_id: string;
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

export type ContestBanListFilters = {
  page?: number;
  per_page?: number;
};

export type CreateContestBanInput = {
  external_user_id: string;
  account_id: string;
  reason: string;
};

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
  banner_image_url?: string | null;
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
