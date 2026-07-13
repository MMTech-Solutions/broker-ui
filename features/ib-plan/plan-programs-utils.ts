import type { IbPlanProgram, PlanProgramAssignment } from "@/features/ib-plan/types";
import type { IbProgram } from "@/features/ib-program/types";

export function mapPlanProgramsToAssignments(
  planPrograms: IbPlanProgram[],
): PlanProgramAssignment[] {
  return [...planPrograms]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((entry) => ({
      ibProgramId: entry.program.id,
      name: entry.program.name,
      description: entry.program.description,
      sortOrder: entry.sort_order,
      progressionMinVolume: entry.progression_min_volume,
      progressionMaxVolume: entry.progression_max_volume,
    }));
}

export function splitAvailablePrograms(
  allPrograms: IbProgram[],
  assigned: PlanProgramAssignment[],
): IbProgram[] {
  const assignedIds = new Set(assigned.map((entry) => entry.ibProgramId));

  return allPrograms
    .filter((program) => !assignedIds.has(program.id))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function defaultThresholdsForSortOrder(
  sortOrder: number,
  previousMaxVolume: string | null,
): { min: string; max: string } {
  if (sortOrder === 0) {
    return { min: "0", max: "99.9999" };
  }

  const min = previousMaxVolume
    ? String(Math.ceil(parseFloat(previousMaxVolume)))
    : "100";

  return { min, max: String(parseFloat(min) + 100) };
}

export function createAssignmentFromProgram(
  program: IbProgram,
  sortOrder: number,
  previousMaxVolume: string | null,
): PlanProgramAssignment {
  const thresholds = defaultThresholdsForSortOrder(sortOrder, previousMaxVolume);

  return {
    ibProgramId: program.id,
    name: program.name,
    description: program.description,
    sortOrder,
    progressionMinVolume: thresholds.min,
    progressionMaxVolume: thresholds.max,
  };
}

export function normalizeAssignedSortOrders(
  assigned: PlanProgramAssignment[],
): PlanProgramAssignment[] {
  return assigned.map((entry, index) => ({
    ...entry,
    sortOrder: index,
  }));
}

export function assignmentsToSyncPayload(
  assigned: PlanProgramAssignment[],
): {
  ib_program_id: string;
  sort_order: number;
  progression_min_volume: string;
  progression_max_volume: string;
}[] {
  return assigned.map((entry) => ({
    ib_program_id: entry.ibProgramId,
    sort_order: entry.sortOrder,
    progression_min_volume: entry.progressionMinVolume,
    progression_max_volume: entry.progressionMaxVolume,
  }));
}

export function assignmentsSignature(
  assigned: PlanProgramAssignment[],
): string {
  return assigned
    .map(
      (entry) =>
        `${entry.ibProgramId}:${entry.sortOrder}:${entry.progressionMinVolume}:${entry.progressionMaxVolume}`,
    )
    .join("|");
}

export function moveProgramToAvailable(
  available: IbProgram[],
  assigned: PlanProgramAssignment[],
  programId: string,
  thresholdsCache: Map<string, { min: string; max: string }>,
): { available: IbProgram[]; assigned: PlanProgramAssignment[] } {
  const entry = assigned.find((item) => item.ibProgramId === programId);

  if (!entry) {
    return { available, assigned };
  }

  thresholdsCache.set(entry.ibProgramId, {
    min: entry.progressionMinVolume,
    max: entry.progressionMaxVolume,
  });

  const nextAssigned = normalizeAssignedSortOrders(
    assigned.filter((item) => item.ibProgramId !== programId),
  );

  const program: IbProgram = {
    id: entry.ibProgramId,
    name: entry.name,
    description: entry.description,
    settlement_period: "monthly",
    is_active: true,
  };

  const nextAvailable = [...available, program].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return { available: nextAvailable, assigned: nextAssigned };
}

export function moveProgramToAssigned(
  available: IbProgram[],
  assigned: PlanProgramAssignment[],
  programId: string,
  targetIndex: number,
  thresholdsCache: Map<string, { min: string; max: string }>,
): { available: IbProgram[]; assigned: PlanProgramAssignment[] } {
  const program = available.find((item) => item.id === programId);

  if (!program) {
    return { available, assigned };
  }

  const nextAvailable = available.filter((item) => item.id !== programId);
  const cached = thresholdsCache.get(programId);
  const previousMax =
    targetIndex > 0
      ? assigned[targetIndex - 1]?.progressionMaxVolume ?? null
      : assigned.length > 0
        ? assigned[assigned.length - 1]?.progressionMaxVolume ?? null
        : null;

  const newEntry: PlanProgramAssignment = cached
    ? {
        ibProgramId: program.id,
        name: program.name,
        description: program.description,
        sortOrder: targetIndex,
        progressionMinVolume: cached.min,
        progressionMaxVolume: cached.max,
      }
    : createAssignmentFromProgram(program, targetIndex, previousMax);

  const nextAssigned = [...assigned];
  nextAssigned.splice(targetIndex, 0, newEntry);

  return {
    available: nextAvailable,
    assigned: normalizeAssignedSortOrders(nextAssigned),
  };
}

export function reorderAssignedPrograms(
  assigned: PlanProgramAssignment[],
  sourceIndex: number,
  destinationIndex: number,
): PlanProgramAssignment[] {
  if (
    sourceIndex === destinationIndex ||
    sourceIndex < 0 ||
    destinationIndex < 0 ||
    sourceIndex >= assigned.length ||
    destinationIndex >= assigned.length
  ) {
    return assigned;
  }

  const next = [...assigned];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(destinationIndex, 0, moved);

  return normalizeAssignedSortOrders(next);
}

export function updateAssignmentPivot(
  assigned: PlanProgramAssignment[],
  programId: string,
  updates: {
    sortOrder: number;
    progressionMinVolume: string;
    progressionMaxVolume: string;
  },
  thresholdsCache: Map<string, { min: string; max: string }>,
): PlanProgramAssignment[] {
  const current = assigned.find((entry) => entry.ibProgramId === programId);

  if (!current) {
    return assigned;
  }

  const without = assigned.filter((entry) => entry.ibProgramId !== programId);
  const updated: PlanProgramAssignment = {
    ...current,
    sortOrder: updates.sortOrder,
    progressionMinVolume: updates.progressionMinVolume.trim(),
    progressionMaxVolume: updates.progressionMaxVolume.trim(),
  };
  const targetIndex = Math.max(0, Math.min(updates.sortOrder, without.length));

  const next = [...without];
  next.splice(targetIndex, 0, updated);

  thresholdsCache.set(programId, {
    min: updated.progressionMinVolume,
    max: updated.progressionMaxVolume,
  });

  return normalizeAssignedSortOrders(next);
}
