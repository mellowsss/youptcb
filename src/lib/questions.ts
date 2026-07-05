import questionsData from "../../data/questions.json";
import type { DomainId, Question } from "@/types/question";

const questions = questionsData as Question[];

export function getAllQuestions(): Question[] {
  return questions;
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getQuestionsByDomain(domain: DomainId): Question[] {
  return questions.filter((q) => q.domain === domain);
}

export function getQuestionsBySubArea(domain: DomainId, subArea: string): Question[] {
  return questions.filter((q) => q.domain === domain && q.subArea === subArea);
}

export function getActiveQuestions(includeFlagged = false): Question[] {
  if (includeFlagged) return questions;
  return questions.filter((q) => !q.flagged);
}

export function getQuestionCounts(): Record<DomainId, number> {
  const counts: Record<DomainId, number> = {
    medications: 0,
    federal: 0,
    patient_safety: 0,
    order_entry: 0,
  };

  for (const question of questions) {
    counts[question.domain]++;
  }

  return counts;
}

export function shuffleQuestions<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
