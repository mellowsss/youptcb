"use client";

import { DomainBreakdown, StudyAdvicePanel } from "@/components/DomainBreakdown";
import { MissedReviewList } from "@/components/MissedReviewList";
import { Button } from "@/components/ui/Button";
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
    mode === "exam" ? "Practice Exam" : mode === "review" ? "Review Session" : "Practice Session";
  const scoreColor = getOverallScoreGradient(score.percentage);
  const passedOverall = score.percentage >= DOMAIN_PASS_THRESHOLD;

  return (
    <div className="space-y-10 md:space-y-12">
      <section className="overflow-hidden rounded-3xl border border-stone bg-white shadow-soft">
        <div className={`bg-gradient-to-r ${scoreColor} px-6 py-10 text-white md:px-8`}>
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">{modeLabel} Results</p>
          <p className="stat-value mt-3 text-6xl text-white md:text-7xl">{score.percentage}%</p>
          <p className="mt-2 text-sm text-white/85">
            {score.correct} of {score.total} correct
            {timeUsedSeconds !== undefined &&
              ` · ${Math.floor(timeUsedSeconds / 60)}m ${timeUsedSeconds % 60}s`}
          </p>
          <p className="mt-4 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest">
            {passedOverall
              ? `At or above ${DOMAIN_PASS_THRESHOLD}% goal`
              : `Goal: ${DOMAIN_PASS_THRESHOLD}%+ to be exam-ready`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 p-6">
          <Button href="/review">Review All Missed</Button>
          <Button href="/practice" variant="secondary">
            Practice More
          </Button>
          {mode === "exam" && (
            <Button href="/exam" variant="ghost">
              Retake Exam
            </Button>
          )}
        </div>
      </section>

      <StudyAdvicePanel
        domainStats={score.domainStats}
        missedQuestions={score.missedQuestions}
        overallPercentage={score.percentage}
      />

      <DomainBreakdown stats={score.domainStats} title="Your Performance vs 2026 Exam Weights" />

      <section>
        <h2 className="section-title mb-6">
          What You Missed ({score.missedQuestions.length})
        </h2>
        <MissedReviewList questions={score.missedQuestions} selectedAnswers={selectedAnswers} />
      </section>

      <p className="text-xs text-forest/30">Session ID: {sessionId}</p>
    </div>
  );
}
