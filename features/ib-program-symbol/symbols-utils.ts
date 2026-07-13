import type {
  IbProgramSymbol,
  ProgramSymbolDraft,
  SyncIbProgramSymbolInput,
} from "@/features/ib-program-symbol/types";
import type { TradingSymbol } from "@/features/trading-server/types";

export function programSymbolFromApi(symbol: IbProgramSymbol): ProgramSymbolDraft {
  return {
    symbol_id: symbol.symbol_id,
    symbol_name: symbol.symbol_name ?? symbol.symbol_id,
    symbol_alpha: symbol.symbol_name ?? "",
    use_for_volume_payment: symbol.use_for_volume_payment,
    use_for_plan_progression: symbol.use_for_plan_progression,
    use_for_cpa: symbol.use_for_cpa,
    commission_value: symbol.commission_value ?? "",
    commission_type: symbol.commission_type ?? "",
    ib_payment_template_id: symbol.ib_payment_template_id ?? "",
  };
}

export function programSymbolFromTradingSymbol(
  symbol: TradingSymbol,
): ProgramSymbolDraft {
  return {
    symbol_id: symbol.id,
    symbol_name: symbol.name,
    symbol_alpha: symbol.alpha,
    use_for_volume_payment: false,
    use_for_plan_progression: true,
    use_for_cpa: false,
    commission_value: "",
    commission_type: "",
    ib_payment_template_id: "",
  };
}

export function draftsSignature(drafts: ProgramSymbolDraft[]): string {
  return JSON.stringify(
    [...drafts]
      .sort((left, right) => left.symbol_id.localeCompare(right.symbol_id))
      .map((draft) => ({
        symbol_id: draft.symbol_id,
        use_for_volume_payment: draft.use_for_volume_payment,
        use_for_plan_progression: draft.use_for_plan_progression,
        use_for_cpa: draft.use_for_cpa,
        commission_value: draft.commission_value,
        commission_type: draft.commission_type,
        ib_payment_template_id: draft.ib_payment_template_id,
      })),
  );
}

export function draftToSyncInput(
  draft: ProgramSymbolDraft,
): SyncIbProgramSymbolInput {
  const payload: SyncIbProgramSymbolInput = {
    symbol_id: draft.symbol_id,
    use_for_volume_payment: draft.use_for_volume_payment,
    use_for_plan_progression: draft.use_for_plan_progression,
    use_for_cpa: draft.use_for_cpa,
  };

  if (draft.use_for_volume_payment) {
    payload.commission_value = Number(draft.commission_value);
    payload.commission_type = draft.commission_type || null;
    payload.ib_payment_template_id = draft.ib_payment_template_id || null;
  }

  return payload;
}

export function validateProgramSymbolDraft(draft: ProgramSymbolDraft): string | null {
  if (
    !draft.use_for_volume_payment &&
    !draft.use_for_plan_progression &&
    !draft.use_for_cpa
  ) {
    return "At least one usage flag must be enabled.";
  }

  if (draft.use_for_volume_payment) {
    if (!draft.commission_value.trim()) {
      return "Commission value is required for volume payment.";
    }

    if (Number.isNaN(Number(draft.commission_value))) {
      return "Commission value must be a number.";
    }

    if (!draft.commission_type) {
      return "Commission type is required for volume payment.";
    }

    if (!draft.ib_payment_template_id) {
      return "Payment template is required for volume payment.";
    }
  }

  return null;
}

export function summarizeSymbolFlags(draft: ProgramSymbolDraft): string {
  const flags: string[] = [];

  if (draft.use_for_volume_payment) {
    flags.push("Volume");
  }

  if (draft.use_for_plan_progression) {
    flags.push("Progression");
  }

  if (draft.use_for_cpa) {
    flags.push("CPA");
  }

  return flags.join(" · ") || "—";
}
