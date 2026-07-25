import mathData from "../../data/pharmacy-math.json";
import type { MathCategory, MathProblem } from "@/types/math";

const problems = mathData as MathProblem[];

export function getAllMathProblems(): MathProblem[] {
  return problems;
}

export function getMathProblemById(id: string): MathProblem | undefined {
  return problems.find((p) => p.id === id);
}

export function getMathCategories(): MathCategory[] {
  return Array.from(new Set(problems.map((p) => p.category))).sort();
}

export function getMathByCategory(category: MathCategory | "all"): MathProblem[] {
  if (category === "all") return problems;
  return problems.filter((p) => p.category === category);
}

export function shuffleMath<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const MATH_STUDY_TIPS = [
  "Translate the SIG to doses/day before any days' supply math.",
  "Keep units aligned — convert lb→kg and mcg↔mg before dosing.",
  "Memorize: 1 tsp=5 mL, 1 tbsp=15 mL, 1 fl oz≈30 mL, 1 pint≈473 mL.",
  "For dilutions use C1V1 = C2V2, then qs with diluent to final volume.",
  "Order Entry is 22.5% of the 2026 PTCE — math shows up every exam.",
  "Practice timed mixed sets: days' supply, percent strength, and flow rates.",
  "Write the formula first, then plug numbers — fewer careless errors.",
];
