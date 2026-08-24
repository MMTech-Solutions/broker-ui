import type {
  ScheduledCommandParameterType,
  ScheduledCommandParameterValue,
  ScheduledCommandParameters,
} from "@/features/scheduling/types";

const MUTUALLY_EXCLUSIVE_FLAGS: Record<string, string[]> = {
  "--pnl-only": ["--volume-only"],
  "--volume-only": ["--pnl-only"],
  "--external-trader-id": ["--external-user-id"],
  "--external-user-id": ["--external-trader-id"],
};

export function parameterType(
  parameterTypes: Record<string, ScheduledCommandParameterType> | undefined,
  parameter: string,
): ScheduledCommandParameterType {
  return parameterTypes?.[parameter] ?? "flag";
}

export function parametersFromAllowed(
  allowedParameters: string[],
  current: ScheduledCommandParameters | null | undefined,
  parameterTypes?: Record<string, ScheduledCommandParameterType>,
): ScheduledCommandParameters {
  const next: ScheduledCommandParameters = {};

  for (const flag of allowedParameters) {
    next[flag] = parameterType(parameterTypes, flag) === "string-list"
      ? (Array.isArray(current?.[flag]) ? current[flag] : [])
      : current?.[flag] === true;
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
    Object.entries(parameters).filter(([, value]) =>
      value === true || (Array.isArray(value) && value.length > 0),
    ),
  );

  return Object.keys(selected).length > 0 ? selected : null;
}

export function setParameterList(
  current: ScheduledCommandParameters,
  parameter: string,
  value: string,
): ScheduledCommandParameters {
  const values = Array.from(
    new Set(value.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean)),
  );
  const next = { ...current, [parameter]: values };

  if (values.length > 0) {
    for (const exclusive of MUTUALLY_EXCLUSIVE_FLAGS[parameter] ?? []) {
      next[exclusive] = [];
    }
  }

  return next;
}

export function parameterListText(value: ScheduledCommandParameterValue | undefined): string {
  return Array.isArray(value) ? value.join(", ") : "";
}

export function formatParameterFlags(
  parameters: ScheduledCommandParameters | null | undefined,
): string {
  if (!parameters) {
    return "—";
  }

  const flags = Object.entries(parameters)
    .flatMap(([flag, value]) => value === true
      ? [flag]
      : Array.isArray(value) && value.length > 0
        ? [`${flag}=${value.join(",")}`]
        : [],
    );

  return flags.length > 0 ? flags.join(" ") : "—";
}
