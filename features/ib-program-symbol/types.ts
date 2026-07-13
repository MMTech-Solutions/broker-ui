export type IbProgramSymbolCommissionType = "fixed" | "percentage";

export type IbProgramSymbol = {
  id: string;
  ib_program_id: string;
  symbol_id: string;
  symbol_name?: string;
  use_for_volume_payment: boolean;
  use_for_plan_progression: boolean;
  use_for_cpa: boolean;
  commission_value: string | null;
  commission_type: IbProgramSymbolCommissionType | null;
  ib_payment_template_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type IbProgramSymbolListFilters = {
  symbol_id?: string;
  use_for_volume_payment?: boolean;
  use_for_plan_progression?: boolean;
  use_for_cpa?: boolean;
  commission_type?: IbProgramSymbolCommissionType;
  ib_payment_template_id?: string;
  page?: number;
  per_page?: number;
};

export type SyncIbProgramSymbolInput = {
  symbol_id: string;
  use_for_volume_payment: boolean;
  use_for_plan_progression: boolean;
  use_for_cpa: boolean;
  commission_value?: number | null;
  commission_type?: IbProgramSymbolCommissionType | null;
  ib_payment_template_id?: string | null;
};

export type SyncIbProgramSymbolsInput = {
  symbols: SyncIbProgramSymbolInput[];
};

export type ProgramSymbolDraft = {
  symbol_id: string;
  symbol_name: string;
  symbol_alpha: string;
  use_for_volume_payment: boolean;
  use_for_plan_progression: boolean;
  use_for_cpa: boolean;
  commission_value: string;
  commission_type: IbProgramSymbolCommissionType | "";
  ib_payment_template_id: string;
};

export const IB_PROGRAM_SYMBOL_COMMISSION_TYPES: {
  value: IbProgramSymbolCommissionType;
  label: string;
}[] = [
  { value: "fixed", label: "Fixed" },
  { value: "percentage", label: "Percentage" },
];
