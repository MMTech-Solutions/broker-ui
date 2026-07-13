export type PlanProgramDragPayload = {
  programId: string;
  source: "available" | "assigned";
  sourceIndex?: number;
};

export const PLAN_PROGRAM_DRAG_MIME = "application/x-ib-plan-program";

export function encodePlanProgramDragPayload(
  payload: PlanProgramDragPayload,
): string {
  return JSON.stringify(payload);
}

export function decodePlanProgramDragPayload(
  raw: string,
): PlanProgramDragPayload | null {
  try {
    return JSON.parse(raw) as PlanProgramDragPayload;
  } catch {
    return null;
  }
}
