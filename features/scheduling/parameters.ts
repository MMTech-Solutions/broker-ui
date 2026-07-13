import type { ScheduledCommandParameters } from "@/features/scheduling/types";

const MUTUALLY_EXCLUSIVE_FLAGS: Record<string, string[]> = {
  "--pnl-only": ["--volume-only"],
  "--volume-only": ["--pnl-only"],
};

export function parametersFromAllowed(
  allowedParameters: string[],
  current: ScheduledCommandParameters | null | undefined,
): ScheduledCommandParameters {
  const next: ScheduledCommandParameters = {};

  for (const flag of allowedParameters) {
    next[flag] = current?.[flag] === true;
  }

  return next;
}

export function toggleParameterFlag(
  current: ScheduledCommandParameters,
  flag: string,
  enabled: boolean,
): ScheduledCommandParameters {
  const next: ScheduledCommandParameters = {
    ...current,
    [flag]: enabled,
  };

  if (enabled) {
    for (const exclusive of MUTUALLY_EXCLUSIVE_FLAGS[flag] ?? []) {
      if (exclusive in next) {
        next[exclusive] = false;
      }
    }
  }

  return next;
}

export function selectedParameters(
  parameters: ScheduledCommandParameters,
): ScheduledCommandParameters | null {
  const selected = Object.fromEntries(
    Object.entries(parameters).filter(([, enabled]) => enabled),
  );

  return Object.keys(selected).length > 0 ? selected : null;
}

export function formatParameterFlags(
  parameters: ScheduledCommandParameters | null | undefined,
): string {
  if (!parameters) {
    return "—";
  }

  const flags = Object.entries(parameters)
    .filter(([, enabled]) => enabled)
    .map(([flag]) => flag);

  return flags.length > 0 ? flags.join(" ") : "—";
}
