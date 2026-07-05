"use client";

import { useCallback, useMemo, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { ExamTimer } from "@/components/ExamTimer";
import { SessionResults } from "@/components/SessionResults";
import { buildMockExam } from "@/lib/exam-builder";
import { MOCK_EXAM_SIZE, MOCK_EXAM_TIME_SECONDS } from "@/lib/domains";
import { scoreSession } from "@/lib/scoring";
import { useProgress } from "@/hooks/useProgress";
import type { AnswerRecord } from "@/types/question";

export default function ExamPage() {
  const { saveAnswer, saveSession, createSessionId, repo } = useProgress();
  const [useTimer, setUseTimer] = useState(true);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionId] = useState(() => createSessionId());
  const [startedAt] = useState(() => Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});
  const [timeUsedSeconds, setTimeUsedSeconds] = useState<number | undefined>();

  const questions = useMemo(
    () => (started ? buildMockExam(repo.getFlaggedQuestionIds()) : []),
    [started, repo]
  );
  const currentQuestion = questions[currentIndex];
  const score = completed ? scoreSession(questions.map((q) => q.id), answers) : null;

  const finishExam = useCallback(() => {
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    setTimeUsedSeconds(elapsed);
    saveSession({
      id: sessionId,
      mode: "exam",
      startedAt,
      completedAt: Date.now(),
      questionIds: questions.map((q) => q.id),
      answers,
      timed: useTimer,
      timeLimitSeconds: MOCK_EXAM_TIME_SECONDS,
      timeUsedSeconds: elapsed,
    });
    setCompleted(true);
  }, [answers, questions, saveSession, sessionId, startedAt, useTimer]);

  const handleSelect = (index: number) => {
    if (!currentQuestion) return;
    setSelectedIndex(index);

    const existing = answers.find((a) => a.questionId === currentQuestion.id);
    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedIndex: index,
      correct: index === currentQuestion.correctIndex,
      timestamp: Date.now(),
      sessionId,
      mode: "exam",
    };

    if (!existing) {
      setAnswers((prev) => [...prev, record]);
      saveAnswer(record);
    } else {
      setAnswers((prev) =>
        prev.map((a) => (a.questionId === currentQuestion.id ? record : a))
      );
    }

    setSelectedMap((prev) => ({ ...prev, [currentQuestion.id]: index }));
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      finishExam();
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    const nextQuestion = questions[currentIndex + 1];
    const existing = answers.find((a) => a.questionId === nextQuestion.id);
    setSelectedIndex(existing?.selectedIndex ?? null);
  };

  const handlePrevious = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex((prev) => prev - 1);
    const prevQuestion = questions[currentIndex - 1];
    const existing = answers.find((a) => a.questionId === prevQuestion.id);
    setSelectedIndex(existing?.selectedIndex ?? null);
  };

  if (completed && score) {
    return (
      <SessionResults
        score={score}
        sessionId={sessionId}
        mode="exam"
        selectedAnswers={selectedMap}
        timeUsedSeconds={timeUsedSeconds}
      />
    );
  }

  if (started && currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-600">
            Mock Exam · {MOCK_EXAM_SIZE} questions · 2026 weighted
          </p>
          {useTimer && (
            <ExamTimer
              totalSeconds={MOCK_EXAM_TIME_SECONDS}
              running={!completed}
              onExpire={finishExam}
            />
          )}
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedIndex={selectedIndex}
          showFeedback={false}
          onSelect={handleSelect}
        />

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary"
          >
            {currentIndex >= questions.length - 1 ? "Submit Exam" : "Next"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Mock Exam</h1>
        <p className="mt-2 text-sm leading-relaxed text-forest/60">
          Simulates the real PTCE with 90 questions distributed by the January 2026 content
          outline: Medications 32, Patient Safety 21, Order Entry 20, Federal 17.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <label className="flex items-center gap-3 text-sm text-forest">
          <input
            type="checkbox"
            checked={useTimer}
            onChange={(e) => setUseTimer(e.target.checked)}
            className="h-4 w-4 rounded border-stone text-sage focus:ring-sage"
          />
          Enable 110-minute timer (real exam length)
        </label>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="btn-primary mt-4 w-full"
        >
          Begin Mock Exam
        </button>
      </div>
    </div>
  );
}
