export const DRUGS_MASTERED_KEY = "yousif-ptcb-drugs-mastered-v1";

export function readMasteredDrugIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DRUGS_MASTERED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function writeMasteredDrugIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRUGS_MASTERED_KEY, JSON.stringify(Array.from(ids)));
}

export function toggleMasteredDrug(id: string): Set<string> {
  const ids = readMasteredDrugIds();
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  writeMasteredDrugIds(ids);
  return ids;
}
