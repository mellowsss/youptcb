"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import { buildPracticeSet } from "@/lib/exam-builder";
import { DOMAINS } from "@/lib/domains";
import { scoreSession } from "@/lib/scoring";
import { useProgress } from "@/hooks/useProgress";
import { SessionResults } from "@/components/SessionResults";
import type { AnswerRecord, DomainId } from "@/types/question";

function PracticeContent() {
  const searchParams = useSearchParams();
  const { saveAnswer, saveSession, createSessionId, repo } = useProgress();

  const initialDomain = (searchParams.get("domain") as DomainId | null) ?? undefined;
  const [domain, setDomain] = useState<DomainId | "all">(initialDomain ?? "all");
  const [subArea, setSubArea] = useState<string>("");
  const [count, setCount] = useState(20);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionId] = useState(() => createSessionId());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});

  const questions = useMemo(() => {
    if (!started) return [];
    return buildPracticeSet({
      domain: domain === "all" ? undefined : domain,
      subArea: subArea || undefined,
      count,
      weighted: domain === "all",
      excludedIds: repo.getFlaggedQuestionIds(),
    });
  }, [started, domain, subArea, count, repo]);

  const currentQuestion = questions[currentIndex];
  const score = completed ? scoreSession(questions.map((q) => q.id), answers) : null;

  const handleStart = () => {
    setStarted(true);
    setCompleted(false);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setShowFeedback(false);
    setAnswers([]);
    setSelectedMap({});
  };

  const handleSelect = (index: number) => {
    if (!currentQuestion || showFeedback) return;
    setSelectedIndex(index);
    setShowFeedback(true);

    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedIndex: index,
      correct: index === currentQuestion.correctIndex,
      timestamp: Date.now(),
      sessionId,
      mode: "practice",
    };

    setAnswers((prev) => [...prev, record]);
    setSelectedMap((prev) => ({ ...prev, [currentQuestion.id]: index }));
    saveAnswer(record);
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      saveSession({
        id: sessionId,
        mode: "practice",
        startedAt: Date.now(),
        completedAt: Date.now(),
        questionIds: questions.map((q) => q.id),
        answers,
      });
      setCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setShowFeedback(false);
  };

  if (completed && score) {
    return (
      <SessionResults
        score={score}
        sessionId={sessionId}
        mode="practice"
        selectedAnswers={selectedMap}
      />
    );
  }

  if (started && currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedIndex={selectedIndex}
          showFeedback={showFeedback}
          onSelect={handleSelect}
          disabled={showFeedback}
        />
        {showFeedback && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              {currentIndex >= questions.length - 1 ? "View Results" : "Next Question"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const selectedDomain = domain === "all" ? null : DOMAINS.find((d) => d.id === domain);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Practice Mode</h1>
        <p className="mt-2 text-sm text-forest/60">
          Immediate feedback after each answer. Wrong answers are saved to your missed queue.
        </p>
      </div>

      <div className="glass-card space-y-4 rounded-3xl p-6">
        <label className="block text-sm font-medium text-forest">
          Domain
          <select
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value as DomainId | "all");
              setSubArea("");
            }}
            className="mt-1 w-full rounded-xl border border-stone bg-white focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 px-3 py-2"
          >
            <option value="all">All domains (2026 weighted)</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        {selectedDomain && (
          <label className="block text-sm font-medium text-forest">
            Sub-area (optional)
            <select
              value={subArea}
              onChange={(e) => setSubArea(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone bg-white focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 px-3 py-2"
            >
              <option value="">All sub-areas</option>
              {selectedDomain.subAreas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-sm font-medium text-forest">
          Number of questions
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-stone bg-white focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 px-3 py-2"
          >
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleStart}
          className="btn-primary w-full"
        >
          Start Practice
        </button>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
