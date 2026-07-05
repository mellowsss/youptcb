"use client";

import { useMemo, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { MissedReviewList } from "@/components/MissedReviewList";
import { buildReviewSet } from "@/lib/exam-builder";
import { DOMAIN_MAP, DOMAINS } from "@/lib/domains";
import { getQuestionById } from "@/lib/questions";
import { scoreSession } from "@/lib/scoring";
import { useProgress } from "@/hooks/useProgress";
import { SessionResults } from "@/components/SessionResults";
import type { AnswerRecord, DomainId } from "@/types/question";

export default function ReviewPage() {
  const { ready, missedRecords, saveAnswer, saveSession, createSessionId, repo } = useProgress();
  const [filterDomain, setFilterDomain] = useState<DomainId | "all">("all");
  const [mode, setMode] = useState<"browse" | "quiz">("browse");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sessionId] = useState(() => createSessionId());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});

  const filteredMissedIds = useMemo(() => {
    const ids = missedRecords
      .filter((m) => !m.mastered)
      .filter((m) => {
        if (filterDomain === "all") return true;
        const question = getQuestionById(m.questionId);
        return question?.domain === filterDomain;
      })
      .sort((a, b) => b.missCount - a.missCount)
      .map((m) => m.questionId);
    return ids;
  }, [missedRecords, filterDomain]);

  const browseQuestions = useMemo(
    () => buildReviewSet(filteredMissedIds),
    [filteredMissedIds]
  );

  const quizQuestions = useMemo(
    () => (started ? buildReviewSet(filteredMissedIds) : []),
    [started, filteredMissedIds]
  );

  const currentQuestion = quizQuestions[currentIndex];
  const score = completed ? scoreSession(quizQuestions.map((q) => q.id), answers) : null;

  if (!ready) {
    return <div className="py-12 text-center text-slate-500">Loading missed questions...</div>;
  }

  if (completed && score) {
    return (
      <SessionResults
        score={score}
        sessionId={sessionId}
        mode="review"
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
          totalQuestions={quizQuestions.length}
          selectedIndex={selectedIndex}
          showFeedback={showFeedback}
          onSelect={(index) => {
            setSelectedIndex(index);
            setShowFeedback(true);
            const record: AnswerRecord = {
              questionId: currentQuestion.id,
              selectedIndex: index,
              correct: index === currentQuestion.correctIndex,
              timestamp: Date.now(),
              sessionId,
              mode: "review",
            };
            setAnswers((prev) => [...prev, record]);
            setSelectedMap((prev) => ({ ...prev, [currentQuestion.id]: index }));
            saveAnswer(record);
          }}
          disabled={showFeedback}
        />
        {showFeedback && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => repo.markMastered(currentQuestion.id)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Mark mastered
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentIndex >= quizQuestions.length - 1) {
                  saveSession({
                    id: sessionId,
                    mode: "review",
                    startedAt: Date.now(),
                    completedAt: Date.now(),
                    questionIds: quizQuestions.map((q) => q.id),
                    answers,
                  });
                  setCompleted(true);
                  return;
                }
                setCurrentIndex((prev) => prev + 1);
                setSelectedIndex(null);
                setShowFeedback(false);
              }}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
            >
              {currentIndex >= quizQuestions.length - 1 ? "View Results" : "Next"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Review Missed Questions</h1>
        <p className="mt-2 text-sm text-slate-600">
          Questions you got wrong are saved here. Answer correctly twice in a row to auto-master,
          or mark manually.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value as DomainId | "all")}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All domains</option>
          {DOMAINS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setMode("browse")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            mode === "browse" ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-700"
          }`}
        >
          Browse ({browseQuestions.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("quiz");
            setStarted(true);
            setCompleted(false);
            setCurrentIndex(0);
            setAnswers([]);
            setSelectedMap({});
          }}
          disabled={browseQuestions.length === 0}
          className={`rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40 ${
            mode === "quiz" ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-700"
          }`}
        >
          Re-quiz missed
        </button>
      </div>

      {browseQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">No missed questions in this filter. Take a practice session or mock exam.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DOMAINS.map((domain) => {
              const count = missedRecords.filter((m) => {
                if (m.mastered) return false;
                const q = getQuestionById(m.questionId);
                return q?.domain === domain.id;
              }).length;
              return (
                <div key={domain.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className={`text-sm font-semibold ${domain.color}`}>{domain.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500">{DOMAIN_MAP[domain.id].shortLabel} missed</p>
                </div>
              );
            })}
          </div>
          <MissedReviewList
            questions={browseQuestions}
            onMarkMastered={(id) => repo.markMastered(id)}
          />
        </>
      )}
    </div>
  );
}
