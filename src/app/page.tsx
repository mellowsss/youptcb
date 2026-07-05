"use client";

import Link from "next/link";
import { DomainBreakdown } from "@/components/DomainBreakdown";
import { DOMAINS } from "@/lib/domains";
import { getAllQuestions, getQuestionCounts } from "@/lib/questions";
import { useProgress } from "@/hooks/useProgress";

const statStyles = [
  { gradient: "from-blue-500 to-cyan-500", icon: "📊" },
  { gradient: "from-violet-500 to-purple-500", icon: "✅" },
  { gradient: "from-rose-500 to-pink-500", icon: "❌" },
  { gradient: "from-amber-500 to-orange-500", icon: "📖" },
];

export default function DashboardPage() {
  const { ready, stats, missedQuestionIds, snapshot } = useProgress();
  const questionCounts = getQuestionCounts();
  const totalQuestions = getAllQuestions().length;

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="glass-card rounded-2xl px-8 py-6 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-slate-600">Loading your progress...</p>
        </div>
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
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 p-6 text-white shadow-2xl shadow-indigo-500/30 md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            ✨ January 2026 PTCE Aligned
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">Yousif PTCB</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-100 md:text-base">
            Master the 2026 exam with {totalQuestions}+ questions weighted to official domain
            percentages. Track what you miss and focus on weak areas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/exam" className="btn-primary inline-block">
              Start Mock Exam (90 Q)
            </Link>
            <Link href="/review" className="btn-secondary inline-block">
              Review Missed ({missedQuestionIds.length})
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statLabels.map((label, i) => (
          <StatCard
            key={label}
            label={label}
            value={statValues[i]}
            gradient={statStyles[i].gradient}
            icon={statStyles[i].icon}
          />
        ))}
      </section>

      <DomainBreakdown stats={stats.domainStats} title="Your Performance vs 2026 Exam Weights" />

      {snapshot.sessions.length > 0 && (
        <section className="glass-card rounded-3xl p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Sessions</h2>
          <div className="space-y-2">
            {[...snapshot.sessions]
              .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
              .slice(0, 5)
              .map((session) => (
                <Link
                  key={session.id}
                  href={`/results/${session.id}`}
                  className="glass-card-hover flex items-center justify-between rounded-2xl border border-slate-100 bg-white/60 px-4 py-3 text-sm"
                >
                  <span className="font-medium capitalize text-slate-700">{session.mode}</span>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
                    {session.answers.filter((a) => a.correct).length}/{session.questionIds.length}
                  </span>
                </Link>
              ))}
          </div>
        </section>
      )}

      <section className="glass-card rounded-3xl p-6">
        <h2 className="mb-1 text-lg font-bold text-slate-900">2026 Question Bank</h2>
        <p className="mb-5 text-sm text-slate-500">Tap a domain to practice</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {DOMAINS.map((domain) => (
            <Link
              key={domain.id}
              href={`/practice?domain=${domain.id}`}
              className="glass-card-hover group overflow-hidden rounded-2xl border border-white/60 bg-white/50"
            >
              <div className={`h-1.5 bg-gradient-to-r ${domain.gradient}`} />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className={`font-bold ${domain.color}`}>{domain.label}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                    {Math.round(domain.examWeight * 100)}%
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {questionCounts[domain.id]}
                  <span className="ml-1 text-sm font-normal text-slate-500">questions</span>
                </p>
                <p className="mt-2 text-xs font-medium text-slate-400 group-hover:text-indigo-500">
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

function StatCard({
  label,
  value,
  gradient,
  icon,
}: {
  label: string;
  value: string;
  gradient: string;
  icon: string;
}) {
  return (
    <div className="glass-card glass-card-hover overflow-hidden rounded-2xl">
      <div className={`bg-gradient-to-r ${gradient} px-5 py-2 text-lg`}>{icon}</div>
      <div className="p-5">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      </div>
    </div>
  );
}
