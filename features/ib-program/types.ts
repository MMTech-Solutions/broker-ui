export type IbProgramSettlementPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type IbProgram = {
  id: string;
  name: string;
  description: string;
  image_path?: string | null;
  settlement_period: IbProgramSettlementPeriod;
  is_active: boolean;
  active_ibs_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type IbProgramListFilters = {
  name?: string;
  description?: string;
  settlement_period?: IbProgramSettlementPeriod;
  is_active?: boolean;
  page?: number;
  per_page?: number;
};

export type CreateIbProgramInput = {
  name: string;
  description: string;
  settlement_period?: IbProgramSettlementPeriod;
  is_active?: boolean;
};

export type UpdateIbProgramInput = {
  name?: string;
  description?: string;
  settlement_period?: IbProgramSettlementPeriod;
  is_active?: boolean;
};

export const IB_PROGRAM_SETTLEMENT_PERIODS: {
  value: IbProgramSettlementPeriod;
  label: string;
}[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];
