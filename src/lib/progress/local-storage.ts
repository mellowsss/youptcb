"use client";

import type { AnswerRecord, MissedRecord, SessionRecord } from "@/types/question";
import type { ProgressRepository, ProgressSnapshot } from "@/lib/progress/repository";
import {
  MASTERED_THRESHOLD,
  PROGRESS_STORAGE_KEY,
  QUESTION_FLAGS_STORAGE_KEY,
} from "@/lib/progress/types";

export const PROGRESS_CHANGED_EVENT = "yousif-ptcb-progress-changed";

function notifyProgressChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
}

const EMPTY_SNAPSHOT: ProgressSnapshot = {
  answers: [],
  missed: [],
  sessions: [],
};

function readSnapshot(): ProgressSnapshot {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;

  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return EMPTY_SNAPSHOT;
    return JSON.parse(raw) as ProgressSnapshot;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function writeSnapshot(snapshot: ProgressSnapshot): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
  notifyProgressChanged();
}

function readFlaggedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = localStorage.getItem(QUESTION_FLAGS_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeFlaggedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUESTION_FLAGS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  notifyProgressChanged();
}

function upsertMissed(
  missed: MissedRecord[],
  questionId: string,
  correct: boolean
): MissedRecord[] {
  const existing = missed.find((m) => m.questionId === questionId);

  if (!existing) {
    if (correct) return missed;
    return [
      ...missed,
      {
        questionId,
        missCount: 1,
        consecutiveCorrect: 0,
        lastMissedAt: Date.now(),
        mastered: false,
      },
    ];
  }

  return missed.map((record) => {
    if (record.questionId !== questionId) return record;

    if (correct) {
      const consecutiveCorrect = record.consecutiveCorrect + 1;
      return {
        ...record,
        consecutiveCorrect,
        mastered: consecutiveCorrect >= MASTERED_THRESHOLD,
      };
    }

    return {
      ...record,
      missCount: record.missCount + 1,
      consecutiveCorrect: 0,
      lastMissedAt: Date.now(),
      mastered: false,
    };
  });
}

export class LocalProgressRepository implements ProgressRepository {
  getSnapshot(): ProgressSnapshot {
    return readSnapshot();
  }

  saveAnswer(answer: AnswerRecord): void {
    const snapshot = readSnapshot();
    snapshot.answers.push(answer);
    snapshot.missed = upsertMissed(snapshot.missed, answer.questionId, answer.correct);
    writeSnapshot(snapshot);
  }

  saveSession(session: SessionRecord): void {
    const snapshot = readSnapshot();
    const index = snapshot.sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      snapshot.sessions[index] = session;
    } else {
      snapshot.sessions.push(session);
    }
    writeSnapshot(snapshot);
  }

  getMissedRecords(): MissedRecord[] {
    return readSnapshot().missed.filter((m) => !m.mastered);
  }

  getMissedQuestionIds(): string[] {
    return this.getMissedRecords()
      .sort((a, b) => b.missCount - a.missCount)
      .map((m) => m.questionId);
  }

  markMastered(questionId: string): void {
    const snapshot = readSnapshot();
    snapshot.missed = snapshot.missed.map((record) =>
      record.questionId === questionId
        ? { ...record, mastered: true, consecutiveCorrect: MASTERED_THRESHOLD }
        : record
    );
    writeSnapshot(snapshot);
  }

  resetProgress(): void {
    writeSnapshot(EMPTY_SNAPSHOT);
  }

  updateQuestionFlag(questionId: string, flagged: boolean): void {
    const ids = readFlaggedIds();
    if (flagged) {
      ids.add(questionId);
    } else {
      ids.delete(questionId);
    }
    writeFlaggedIds(ids);
  }

  getFlaggedQuestionIds(): string[] {
    return Array.from(readFlaggedIds());
  }
}

let repository: LocalProgressRepository | null = null;

export function getProgressRepository(): LocalProgressRepository {
  if (!repository) {
    repository = new LocalProgressRepository();
  }
  return repository;
}

export function createSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
