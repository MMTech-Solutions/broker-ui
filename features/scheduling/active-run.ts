import type { ScheduledCommandRun } from "@/features/scheduling/types";

export function hasActiveScheduledCommandRun(
  runs: Pick<ScheduledCommandRun, "status">[],
): boolean {
  return runs.some(
    (run) => run.status === "pending" || run.status === "running",
  );
}

export const ACTIVE_RUN_BLOCK_MESSAGE =
  "A run is already pending or running for this command (BR-SCHED-03).";
