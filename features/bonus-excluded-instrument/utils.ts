import type { BonusExcludedInstrument } from "@/features/bonus-offer/types";
import type { BonusOfferTemplateExcludedInstrument } from "@/features/bonus-offer-template/types";
import type { ExcludedInstrumentDraft } from "@/features/bonus-excluded-instrument/types";
import type { ServerGroup, TradingSymbol } from "@/features/trading-server/types";

export function excludedInstrumentKey(
  serverGroupId: string,
  symbolId: string,
): string {
  return `${serverGroupId}:${symbolId}`;
}

export function excludedInstrumentFromApi(
  instrument: BonusExcludedInstrument | BonusOfferTemplateExcludedInstrument,
  serverGroupName = "",
): ExcludedInstrumentDraft {
  const symbolName =
    instrument.name?.trim() ||
    instrument.alpha?.trim() ||
    instrument.symbol_id;

  return {
    key: excludedInstrumentKey(instrument.server_group_id, instrument.symbol_id),
    server_group_id: instrument.server_group_id,
    server_group_name: serverGroupName,
    symbol_id: instrument.symbol_id,
    symbol_name: symbolName,
    symbol_alpha: instrument.alpha?.trim() || "",
  };
}

export function excludedInstrumentFromTradingSymbol(
  symbol: TradingSymbol,
  serverGroup: ServerGroup,
): ExcludedInstrumentDraft {
  return {
    key: excludedInstrumentKey(serverGroup.id, symbol.id),
    server_group_id: serverGroup.id,
    server_group_name: serverGroup.name,
    symbol_id: symbol.id,
    symbol_name: symbol.name,
    symbol_alpha: symbol.alpha,
  };
}

export function draftsSignature(drafts: ExcludedInstrumentDraft[]): string {
  return JSON.stringify(
    [...drafts]
      .map((draft) => ({
        server_group_id: draft.server_group_id,
        symbol_id: draft.symbol_id,
      }))
      .sort((left, right) =>
        `${left.server_group_id}:${left.symbol_id}`.localeCompare(
          `${right.server_group_id}:${right.symbol_id}`,
        ),
      ),
  );
}

export function draftToSyncInput(draft: ExcludedInstrumentDraft): {
  server_group_id: string;
  symbol_id: string;
} {
  return {
    server_group_id: draft.server_group_id,
    symbol_id: draft.symbol_id,
  };
}
