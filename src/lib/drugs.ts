import drugsData from "../../data/top200-drugs.json";
import type { DrugCategory, TopDrug } from "@/types/drug";

const drugs = drugsData as TopDrug[];

export function getAllDrugs(): TopDrug[] {
  return drugs;
}

export function getDrugById(id: string): TopDrug | undefined {
  return drugs.find((d) => d.id === id);
}

export function getDrugCategories(): DrugCategory[] {
  return Array.from(new Set(drugs.map((d) => d.category))).sort();
}

export function getDrugsByCategory(category: DrugCategory | "all"): TopDrug[] {
  if (category === "all") return drugs;
  return drugs.filter((d) => d.category === category);
}

export function shuffleDrugs<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const DRUG_STUDY_TIPS = [
  "Learn generic → brand → class → indication as one chain.",
  "Group drugs by class first (all ACE inhibitors, all statins, etc.).",
  "Use flashcards daily: 20 new drugs + review 40 old ones.",
  "Focus on high-alert and LASA pairs from your missed questions.",
  "For 2026 PTCE, Medications is 35% — drug names are highest yield.",
  "Say names out loud: generic first, then brand, then class.",
  "Quiz yourself brand → generic (exam tests both directions).",
];
