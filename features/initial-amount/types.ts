export type InitialAmountServerGroup = {
  id: string;
  name: string;
  trading_server_id: string;
  trading_server_label?: string | null;
};

export type InitialAmount = {
  id: string;
  amount: number;
  server_groups_count?: number;
  server_groups?: InitialAmountServerGroup[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type InitialAmountListFilters = {
  amount?: number;
  page?: number;
  per_page?: number;
};

export type CreateInitialAmountInput = {
  amount: number;
};

export type UpdateInitialAmountInput = {
  amount?: number;
};

export type SyncInitialAmountServerGroupsInput = {
  server_group_ids: string[];
};
