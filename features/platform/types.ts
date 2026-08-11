export type Platform = {
  id: string;
  name: string;
  custom_name: string | null;
  description?: string | null;
  image_path?: string | null;
  trading_servers_count?: number;
  is_active?: boolean;
  type?: string;
};

export type AvailablePlatform = {
  name: string;
  label: string;
  value: number;
};

export type PlatformListFilters = {
  name?: string;
  custom_name?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
};

export type CreatePlatformInput = {
  name: string;
  custom_name?: string | null;
  description?: string | null;
  image?: File | null;
  is_active?: boolean;
};

export type UpdatePlatformInput = {
  name?: string;
  custom_name?: string | null;
  description?: string | null;
  image?: File | null;
  remove_image?: boolean;
  is_active?: boolean;
};
