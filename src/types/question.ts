export type DomainId =
  | "medications"
  | "federal"
  | "patient_safety"
  | "order_entry";

export interface Question {
  id: string;
  domain: DomainId;
  subArea: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  isCalculation: boolean;
  flagged?: boolean;
}

export interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timestamp: number;
  sessionId: string;
  mode: "practice" | "exam" | "review";
}

export interface MissedRecord {
  questionId: string;
  missCount: number;
  consecutiveCorrect: number;
  lastMissedAt: number;
  mastered: boolean;
}

export interface SessionRecord {
  id: string;
  mode: "practice" | "exam" | "review";
  startedAt: number;
  completedAt?: number;
  questionIds: string[];
  answers: AnswerRecord[];
  timed?: boolean;
  timeLimitSeconds?: number;
  timeUsedSeconds?: number;
}

export interface DomainStats {
  domain: DomainId;
  total: number;
  correct: number;
  percentage: number;
  examWeight: number;
}

export interface SessionScore {
  total: number;
  correct: number;
  percentage: number;
  domainStats: DomainStats[];
  missedQuestions: Question[];
}
