export function ibProgramSymbolsPath(programId: string): string {
  const params = new URLSearchParams({ programId });

  return `/ib-programs/symbols?${params.toString()}`;
}
