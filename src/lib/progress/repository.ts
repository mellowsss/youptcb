import type { AnswerRecord, MissedRecord, SessionRecord } from "@/types/question";

export interface ProgressSnapshot {
  answers: AnswerRecord[];
  missed: MissedRecord[];
  sessions: SessionRecord[];
}

export interface ProgressRepository {
  getSnapshot(): ProgressSnapshot;
  saveAnswer(answer: AnswerRecord): void;
  saveSession(session: SessionRecord): void;
  getMissedRecords(): MissedRecord[];
  getMissedQuestionIds(): string[];
  markMastered(questionId: string): void;
  resetProgress(): void;
  updateQuestionFlag(questionId: string, flagged: boolean): void;
  getFlaggedQuestionIds(): string[];
}
