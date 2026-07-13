export type IbProgramPaymentRuleType = "volume" | "pnl" | "cpa";

export type IbProgramVolumeRule = {
  id: string;
  ib_program_id: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type IbProgramPnlRule = IbProgramVolumeRule & {
  ib_payment_template_id: string;
};

export type IbProgramCpaRule = IbProgramVolumeRule & {
  cpa_progression_volume_threshold: string;
  cpa_min_external_deposit_amount: string;
  cpa_reward_amount: string;
};

export type IbProgramPaymentRuleListFilters = {
  description?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
};

export type CreateIbProgramVolumeRuleInput = {
  description?: string | null;
  is_active?: boolean;
};

export type UpdateIbProgramVolumeRuleInput = {
  description?: string | null;
  is_active?: boolean;
};

export type CreateIbProgramPnlRuleInput = {
  ib_payment_template_id: string;
  description?: string | null;
  is_active?: boolean;
};

export type UpdateIbProgramPnlRuleInput = {
  ib_payment_template_id?: string;
  description?: string | null;
  is_active?: boolean;
};

export type CreateIbProgramCpaRuleInput = {
  description?: string | null;
  is_active?: boolean;
  cpa_progression_volume_threshold: number;
  cpa_min_external_deposit_amount: number;
  cpa_reward_amount: number;
};

export type UpdateIbProgramCpaRuleInput = {
  description?: string | null;
  is_active?: boolean;
  cpa_progression_volume_threshold?: number;
  cpa_min_external_deposit_amount?: number;
  cpa_reward_amount?: number;
};

export const IB_PROGRAM_PAYMENT_RULE_TYPES: {
  value: IbProgramPaymentRuleType;
  label: string;
  description: string;
}[] = [
  {
    value: "volume",
    label: "Volume",
    description:
      "Rewards IB partners based on traded volume. Symbol rates are configured separately per program.",
  },
  {
    value: "pnl",
    label: "PnL",
    description:
      "Rewards IB partners based on net profit and loss using a payment template.",
  },
  {
    value: "cpa",
    label: "CPA",
    description:
      "One-time rewards when referred traders meet deposit and volume thresholds.",
  },
];
