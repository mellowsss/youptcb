"use client";

import Link from "next/link";
import { DomainBreakdown, StudyAdvicePanel } from "@/components/DomainBreakdown";
import { MissedReviewList } from "@/components/MissedReviewList";
import {
  DOMAIN_PASS_THRESHOLD,
  getOverallScoreGradient,
} from "@/lib/study-advice";
import type { SessionScore } from "@/types/question";

interface SessionResultsProps {
  score: SessionScore;
  sessionId: string;
  mode: "practice" | "exam" | "review";
  selectedAnswers: Record<string, number>;
  timeUsedSeconds?: number;
}

export function SessionResults({
  score,
  sessionId,
  mode,
  selectedAnswers,
  timeUsedSeconds,
}: SessionResultsProps) {
  const modeLabel =
    mode === "exam" ? "Mock Exam" : mode === "review" ? "Review Session" : "Practice Session";
  const scoreColor = getOverallScoreGradient(score.percentage);
  const passedOverall = score.percentage >= DOMAIN_PASS_THRESHOLD;

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-3xl">
        <div className={`bg-gradient-to-r ${scoreColor} px-6 py-8 text-white`}>
          <p className="text-sm font-semibold text-white/80">{modeLabel} Results</p>
          <p className="mt-2 text-5xl font-extrabold tracking-tight">{score.percentage}%</p>
          <p className="mt-1 text-sm text-white/90">
            {score.correct} of {score.total} correct
            {timeUsedSeconds !== undefined &&
              ` · ${Math.floor(timeUsedSeconds / 60)}m ${timeUsedSeconds % 60}s`}
          </p>
          <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            {passedOverall
              ? `✓ At or above ${DOMAIN_PASS_THRESHOLD}% goal`
              : `Goal: ${DOMAIN_PASS_THRESHOLD}%+ to be exam-ready`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 p-5">
          <Link href="/review" className="btn-primary inline-block text-sm">
            Review All Missed
          </Link>
          <Link
            href="/practice"
            className="inline-block rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Practice More
          </Link>
          {mode === "exam" && (
            <Link
              href="/exam"
              className="inline-block rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Retake Mock Exam
            </Link>
          )}
        </div>
      </section>

      <StudyAdvicePanel
        domainStats={score.domainStats}
        missedQuestions={score.missedQuestions}
        overallPercentage={score.percentage}
      />

      <DomainBreakdown
        stats={score.domainStats}
        title="Your Performance vs 2026 Exam Weights"
      />

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          What You Missed ({score.missedQuestions.length})
        </h2>
        <MissedReviewList questions={score.missedQuestions} selectedAnswers={selectedAnswers} />
      </section>

      <p className="text-xs text-slate-400">Session ID: {sessionId}</p>
    </div>
  );
}
