import type { BonusExcludedInstrument } from "@/features/bonus-offer/types";
import type { BonusOfferTemplateExcludedInstrument } from "@/features/bonus-offer-template/types";
import type { ExcludedInstrumentDraft } from "@/features/bonus-excluded-instrument/types";
import type { ServerGroup, TradingSymbol } from "@/features/trading-server/types";

export function excludedInstrumentKey(
  serverGroupId: string,
  symbol: string,
): string {
  return `${serverGroupId}:${symbol.trim().toUpperCase()}`;
}

export function excludedInstrumentFromApi(
  instrument: BonusExcludedInstrument | BonusOfferTemplateExcludedInstrument,
  serverGroupName = "",
): ExcludedInstrumentDraft {
  const symbol = instrument.symbol.trim().toUpperCase();

  return {
    key: excludedInstrumentKey(instrument.server_group_id, symbol),
    server_group_id: instrument.server_group_id,
    server_group_name: serverGroupName,
    symbol,
    symbol_alpha: symbol,
  };
}

export function excludedInstrumentFromTradingSymbol(
  symbol: TradingSymbol,
  serverGroup: ServerGroup,
): ExcludedInstrumentDraft {
  const normalizedSymbol = symbol.name.trim().toUpperCase();

  return {
    key: excludedInstrumentKey(serverGroup.id, normalizedSymbol),
    server_group_id: serverGroup.id,
    server_group_name: serverGroup.name,
    symbol: normalizedSymbol,
    symbol_alpha: symbol.alpha,
  };
}

export function draftsSignature(drafts: ExcludedInstrumentDraft[]): string {
  return JSON.stringify(
    [...drafts]
      .map((draft) => ({
        server_group_id: draft.server_group_id,
        symbol: draft.symbol,
      }))
      .sort((left, right) =>
        `${left.server_group_id}:${left.symbol}`.localeCompare(
          `${right.server_group_id}:${right.symbol}`,
        ),
      ),
  );
}

export function draftToSyncInput(draft: ExcludedInstrumentDraft): {
  server_group_id: string;
  symbol: string;
} {
  return {
    server_group_id: draft.server_group_id,
    symbol: draft.symbol,
  };
}
