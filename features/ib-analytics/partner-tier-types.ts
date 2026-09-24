export type IbPartnerTierProgram = {
  id: string;
  name: string;
  sort_order: number;
  progression_min_volume: string;
  progression_max_volume: string | null;
};

export type IbPartnerTierPaymentSymbol = {
  ib_program_id: string;
  symbol: {
    id: string;
    name: string | null;
    alpha: string | null;
    category: { id: string; name: string } | null;
  };
  commission_type: string | null;
  commission_value: string | null;
  payment_template: {
    id: string;
    name: string;
    levels: Array<{ id: string; name: string; rate: string; sort_order: number }>;
  } | null;
};

export type IbPartnerTier = {
  current_program: IbPartnerTierProgram | null;
  next_program: IbPartnerTierProgram | null;
  placement: {
    progression_metric_value: string | null;
    last_progression_evaluated_at: string | null;
  };
  progression: {
    metric_value: string | null;
    evaluated_at: string | null;
    next_program_min_volume: string | null;
    percentage: number | null;
  };
  programs: IbPartnerTierProgram[];
  payment_symbols: IbPartnerTierPaymentSymbol[];
  progression_templates: Array<{
    id: string;
    name: string;
    levels: Array<{ id: string; level: number; volume_coefficient: string }>;
  }>;
  active_traders: { available: boolean; count: number | null };
};
