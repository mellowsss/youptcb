export const MATH_MASTERED_KEY = "yousif-ptcb-math-mastered-v1";

export function readMasteredMathIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(MATH_MASTERED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function writeMasteredMathIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MATH_MASTERED_KEY, JSON.stringify(Array.from(ids)));
}

export function toggleMasteredMath(id: string): Set<string> {
  const ids = readMasteredMathIds();
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  writeMasteredMathIds(ids);
  return ids;
}
