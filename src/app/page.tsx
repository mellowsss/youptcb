"use client";

import Link from "next/link";
import { BarChart3, BookMarked, Calculator, CheckCircle2, Pill, Target } from "lucide-react";
import { DomainBreakdown } from "@/components/DomainBreakdown";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DOMAINS } from "@/lib/domains";
import { getAllQuestions, getQuestionCounts } from "@/lib/questions";
import { useProgress } from "@/hooks/useProgress";

const statIcons = [BarChart3, CheckCircle2, Target, BookMarked];

export default function DashboardPage() {
  const { ready, stats, missedQuestionIds, snapshot } = useProgress();
  const questionCounts = getQuestionCounts();
  const totalQuestions = getAllQuestions().length;

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Card className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-stone border-t-sage" />
          <p className="text-forest/70">Loading your progress...</p>
        </Card>
      </div>
    );
  }

  const statValues = [
    `${stats.percentage}%`,
    String(stats.totalAnswered),
    String(missedQuestionIds.length),
    String(totalQuestions),
  ];
  const statLabels = ["Overall Score", "Answered", "Missed Queue", "Question Bank"];

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-forest px-6 py-12 text-white shadow-xl md:px-12 md:py-16">
        <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-terracotta/15 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
              January 2026 PTCE Aligned
            </span>
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Yousif <em className="text-sage">PTCB</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              Master the 2026 exam with {totalQuestions}+ questions weighted to official domain
              percentages. Track what you miss and focus on weak areas.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/exam" variant="hero">
                Start Exam
              </Button>
              <Button href="/drugs" variant="heroOutline">
                <Pill className="h-4 w-4" strokeWidth={1.5} />
                Top 200 Drugs
              </Button>
              <Button href="/math" variant="heroOutline">
                <Calculator className="h-4 w-4" strokeWidth={1.5} />
                Pharmacy Math
              </Button>
              <Button href="/review" variant="heroOutline">
                Review Missed ({missedQuestionIds.length})
              </Button>
            </div>
          </div>
          <div className="hero-arch relative hidden overflow-hidden bg-clay-light/10 ring-1 ring-white/10 lg:block">
            <div className="flex aspect-[3/4] items-end p-8">
              <blockquote className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="font-serif text-2xl italic leading-snug text-white">
                  &ldquo;Study with intention. Pass with confidence.&rdquo;
                </p>
                <p className="mt-3 text-sm uppercase tracking-widest text-white/60">2026 PTCE Prep</p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {statLabels.map((label, i) => {
          const Icon = statIcons[i];
          return (
            <Card key={label} hover className={i % 2 === 1 ? "md:translate-y-6" : ""}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-clay-light text-sage">
                <Icon strokeWidth={1.5} className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium uppercase tracking-widest text-forest/50">{label}</p>
              <p className="stat-value mt-2 text-4xl text-forest">{statValues[i]}</p>
            </Card>
          );
        })}
      </section>

      <DomainBreakdown stats={stats.domainStats} title="Your Performance vs 2026 Exam Weights" />

      {snapshot.sessions.length > 0 && (
        <section>
          <h2 className="section-title mb-6">Recent Sessions</h2>
          <div className="space-y-3">
            {[...snapshot.sessions]
              .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
              .slice(0, 5)
              .map((session) => (
                <Link
                  key={session.id}
                  href={`/results/${session.id}`}
                  className="botanical-card-hover flex items-center justify-between rounded-3xl border border-stone bg-white px-5 py-4 shadow-soft transition duration-500"
                >
                  <span className="font-medium capitalize text-forest">{session.mode}</span>
                  <span className="rounded-full bg-clay-light px-4 py-1.5 text-sm font-semibold text-forest">
                    {session.answers.filter((a) => a.correct).length}/{session.questionIds.length}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">2026 Question Bank</h2>
        <p className="mt-2 mb-8 text-forest/60">Tap a domain to begin focused practice</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {DOMAINS.map((domain, index) => (
            <Link
              key={domain.id}
              href={`/practice?domain=${domain.id}`}
              className={`botanical-card-hover group overflow-hidden rounded-3xl border border-stone bg-white shadow-soft transition duration-500 ${
                index % 2 === 1 ? "md:translate-y-8" : ""
              }`}
            >
              <div className={`h-1.5 bg-gradient-to-r ${domain.gradient}`} />
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className={`font-serif text-lg font-semibold ${domain.color}`}>{domain.label}</p>
                  <span className="rounded-full bg-clay-light px-3 py-1 text-xs font-medium uppercase tracking-widest text-forest/70">
                    {Math.round(domain.examWeight * 100)}%
                  </span>
                </div>
                <p className="stat-value mt-4 text-3xl text-forest">
                  {questionCounts[domain.id]}
                  <span className="ml-2 font-sans text-sm font-normal text-forest/50">questions</span>
                </p>
                <p className="mt-4 text-sm font-medium uppercase tracking-widest text-sage transition duration-300 group-hover:text-terracotta">
                  Start practicing →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
