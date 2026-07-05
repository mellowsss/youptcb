"use client";

import { useCallback, useEffect, useState } from "react";
import { getOverallStats } from "@/lib/scoring";
import {
  createSessionId,
  getProgressRepository,
} from "@/lib/progress/local-storage";
import type { ProgressSnapshot } from "@/lib/progress/repository";
import type { AnswerRecord, SessionRecord } from "@/types/question";

export function useProgress() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>({
    answers: [],
    missed: [],
    sessions: [],
  });
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    const repo = getProgressRepository();
    setSnapshot(repo.getSnapshot());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveAnswer = useCallback(
    (answer: AnswerRecord) => {
      getProgressRepository().saveAnswer(answer);
      refresh();
    },
    [refresh]
  );

  const saveSession = useCallback(
    (session: SessionRecord) => {
      getProgressRepository().saveSession(session);
      refresh();
    },
    [refresh]
  );

  const missedQuestionIds = ready
    ? snapshot.missed.filter((m) => !m.mastered).map((m) => m.questionId)
    : [];

  const stats = getOverallStats(snapshot.answers);

  return {
    ready,
    snapshot,
    stats,
    missedQuestionIds,
    missedRecords: snapshot.missed.filter((m) => !m.mastered),
    saveAnswer,
    saveSession,
    refresh,
    createSessionId,
    repo: getProgressRepository(),
  };
}
