import type { IbVolumeRewardTradeFlag } from "@/features/reports/ib-volume-reward-trades/types";

export function formatReportNumber(value: string | number | null | undefined, maximumFractionDigits = 4): string {
  if (value === null || value === undefined || value === "") return "—";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits }).format(parsed);
}

export function formatReportMoney(value: string | number | null | undefined, currency: string | null | undefined, precision: number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const formatted = formatReportNumber(value, precision ?? 2);
  return currency ? `${formatted} ${currency}` : formatted;
}

export function formatReportRatio(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat(undefined, { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(parsed);
}

export function formatReportDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function formatDuration(seconds: string | number | null): string {
  if (seconds === null) return "—";
  const value = Number(seconds);
  if (!Number.isFinite(value)) return String(seconds);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const remainder = value % 60;
  return [hours ? `${hours}h` : null, minutes ? `${minutes}m` : null, `${remainder}s`].filter(Boolean).join(" ");
}

export function reportFlagLabel(flag: IbVolumeRewardTradeFlag): string {
  return ({
    reward_exceeds_revenue: "Reward > revenue",
    scalp_under_60_seconds: "Scalping < 60s",
    multi_ib: "Multi-IB",
    bonus_group: "Grupo bonus",
    no_markup: "Sin markup",
    economics_unavailable: "Economics no disponible",
  } satisfies Record<IbVolumeRewardTradeFlag, string>)[flag];
}

export function reportFlagLetter(flag: IbVolumeRewardTradeFlag): string {
  return ({
    reward_exceeds_revenue: "R",
    scalp_under_60_seconds: "S",
    multi_ib: "M",
    bonus_group: "B",
    no_markup: "0",
    economics_unavailable: "E",
  } satisfies Record<IbVolumeRewardTradeFlag, string>)[flag];
}

export function reportFlagDescription(flag: IbVolumeRewardTradeFlag): string {
  return ({
    reward_exceeds_revenue: "El reward pagado supera el revenue.",
    scalp_under_60_seconds: "La posición duró menos de 60 segundos.",
    multi_ib: "La posición distribuyó rewards a más de un IB.",
    bonus_group: "La cuenta pertenece a un grupo bonus.",
    no_markup: "Existe snapshot económico y el markup por lote es cero.",
    economics_unavailable: "Falta el snapshot económico o el book requerido para calcular los importes derivados.",
  } satisfies Record<IbVolumeRewardTradeFlag, string>)[flag];
}

export function environmentLabel(value: number | string): string {
  if (value === 1 || value === "1") return "Demo";
  if (value === 2 || value === "2") return "Live";
  return String(value);
}

export function bookLabel(value: "a_book" | "b_book" | null): string {
  if (value === "a_book") return "A-book";
  if (value === "b_book") return "B-book";
  return "—";
}
