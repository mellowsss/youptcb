export type MathCategory =
  | "Days' Supply"
  | "Quantity to Dispense"
  | "Conversions"
  | "Ratio & Proportion"
  | "Percent Strength"
  | "Dilutions"
  | "Weight-Based Dosing"
  | "IV Flow Rates"
  | "Sig & Roman Numerals";

export type MathDifficulty = "standard" | "hard";

export interface MathProblem {
  id: string;
  title: string;
  category: MathCategory;
  difficulty: MathDifficulty;
  formula: string;
  prompt: string;
  answer: string;
  distractors: [string, string, string];
  explanation: string;
  ptceTip: string;
}