import type {
  RiskMetricChangedPayload,
  RiskMetricsHistory,
  RiskMetricsHistoryPoint,
  RiskMetricsSummary,
} from "@/features/client-risk-metrics/types";

function parseMetricJsonValue(raw: string | null): number | null {
  if (raw === null || raw === "") {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed === "number" && Number.isFinite(parsed)) {
      return parsed;
    }

    if (typeof parsed === "string") {
      const asNumber = Number(parsed);
      return Number.isFinite(asNumber) ? asNumber : null;
    }

    if (typeof parsed === "boolean") {
      return parsed ? 1 : 0;
    }
  } catch {
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) {
      return asNumber;
    }
  }

  return null;
}

function toUtcDateKey(changedAt: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(changedAt)) {
    return changedAt.slice(0, 10);
  }

  const date = new Date(changedAt);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

/**
 * Applies a live MetricChanges payload onto an existing summary snapshot.
 * Updates the series point for the change date and refreshes daily_deltas.
 */
export function applyRiskMetricChanges(
  summary: RiskMetricsSummary,
  payload: RiskMetricChangedPayload,
): RiskMetricsSummary {
  const dateKey = toUtcDateKey(payload.changed_at);
  const dates = [...summary.dates_utc];
  const series: Record<string, (number | null)[]> = {};

  for (const [key, values] of Object.entries(summary.series)) {
    series[key] = [...values];
  }

  const dailyDeltas = { ...summary.daily_deltas };
  let dateIndex = dates.indexOf(dateKey);

  if (dateIndex === -1) {
    dates.push(dateKey);
    dateIndex = dates.length - 1;

    for (const key of Object.keys(series)) {
      series[key].push(null);
    }
  }

  for (const change of payload.changes) {
    const newValue = parseMetricJsonValue(change.new_value_json);
    const oldValue = parseMetricJsonValue(change.old_value_json);

    if (!series[change.key]) {
      series[change.key] = dates.map(() => null);
    } else if (series[change.key].length < dates.length) {
      while (series[change.key].length < dates.length) {
        series[change.key].push(null);
      }
    }

    series[change.key][dateIndex] = newValue;

    if (newValue !== null && oldValue !== null) {
      dailyDeltas[change.key] = {
        previous: oldValue,
        diff: newValue - oldValue,
      };
    } else if (newValue !== null) {
      dailyDeltas[change.key] = {
        previous: newValue,
        diff: 0,
      };
    }
  }

  return {
    ...summary,
    dates_utc: dates,
    series,
    daily_deltas: dailyDeltas,
    series_end_date_utc:
      dateKey > summary.series_end_date_utc
        ? dateKey
        : summary.series_end_date_utc,
    phase_id: payload.phase_id ?? summary.phase_id,
    phase_name: payload.phase_name ?? summary.phase_name,
  };
}

function toUnixSecond(value: string): number | null {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : null;
}

/**
 * Appends the latest equity change at its actual event timestamp. Points that
 * land in the same second are replaced so Lightweight Charts receives unique,
 * strictly ascending timestamps.
 */
export function applyLiveEquityChange(
  history: RiskMetricsHistory,
  payload: RiskMetricChangedPayload,
): RiskMetricsHistory {
  const equityChange = payload.changes.find((change) => change.key === "equity");
  const value = equityChange
    ? parseMetricJsonValue(equityChange.new_value_json)
    : null;
  const changedAtSecond = toUnixSecond(payload.changed_at);

  if (value === null || changedAtSecond === null) {
    return history;
  }

  const pointsBySecond = new Map<number, RiskMetricsHistoryPoint>();

  for (const point of history.points) {
    const second = toUnixSecond(point.at);
    if (second !== null) {
      pointsBySecond.set(second, point);
    }
  }

  const previousPoint = pointsBySecond.get(changedAtSecond);
  pointsBySecond.set(changedAtSecond, {
    at: new Date(changedAtSecond * 1000).toISOString(),
    value,
    delta_from_prev: previousPoint ? value - previousPoint.value : null,
  });

  const points = Array.from(pointsBySecond.entries())
    .sort(([left], [right]) => left - right)
    .map(([, point]) => point)
    .slice(-5000);

  return {
    ...history,
    points,
    summary: {
      ...history.summary,
      rows_returned: points.length,
      last_at: points.at(-1)?.at ?? history.summary.last_at,
    },
  };
}
