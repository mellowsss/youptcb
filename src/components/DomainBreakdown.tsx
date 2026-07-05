"use client";

import Link from "next/link";
import { DOMAIN_MAP } from "@/lib/domains";
import {
  DOMAIN_PASS_THRESHOLD,
  generateStudyAdvice,
  getDomainPerformanceStatus,
  getDomainStatusLabel,
  getPerformanceColor,
} from "@/lib/study-advice";
import type { DomainStats, Question } from "@/types/question";

interface DomainBreakdownProps {
  stats: DomainStats[];
  title?: string;
  showPassThreshold?: boolean;
}

export function DomainBreakdown({
  stats,
  title = "Performance by Domain",
  showPassThreshold = true,
}: DomainBreakdownProps) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {showPassThreshold && (
          <p className="text-xs font-semibold text-slate-500">
            Goal: {DOMAIN_PASS_THRESHOLD}%+ per domain to be exam-ready
          </p>
        )}
      </div>
      <div className="space-y-5">
        {stats.map((stat) => {
          const domain = DOMAIN_MAP[stat.domain];
          const pct = stat.total > 0 ? stat.percentage : 0;
          const status = getDomainPerformanceStatus(stat);
          const statusLabel = getDomainStatusLabel(status);

          return (
            <div key={stat.domain}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${domain.color}`}>{domain.label}</span>
                  <StatusBadge status={status} label={statusLabel} />
                </div>
                <span className={`font-medium ${getPerformanceColor(stat.percentage, stat.total)}`}>
                  {stat.total > 0
                    ? `${stat.correct}/${stat.total} (${stat.percentage}%)`
                    : "Not tested yet"}{" "}
                  · exam weight {Math.round(domain.examWeight * 100)}%
                </span>
              </div>
              <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-500 ${
                    status === "good"
                      ? domain.gradient
                      : status === "needs_work"
                        ? "from-rose-400 to-orange-400"
                        : "from-slate-300 to-slate-300"
                  }`}
                  style={{ width: `${pct}%` }}
                />
                {showPassThreshold && (
                  <div
                    className="absolute inset-y-0 z-10 border-r-2 border-dashed border-emerald-600/70"
                    style={{ left: `${DOMAIN_PASS_THRESHOLD}%` }}
                    title={`${DOMAIN_PASS_THRESHOLD}% goal`}
                  />
                )}
                <div
                  className="absolute inset-y-0 border-r border-dashed border-slate-400/40"
                  style={{ left: `${Math.round(domain.examWeight * 100)}%` }}
                  title="Exam content weight"
                />
              </div>
              {stat.total > 0 && stat.percentage < DOMAIN_PASS_THRESHOLD && (
                <p className="mt-1.5 text-xs text-rose-600">
                  {DOMAIN_PASS_THRESHOLD - stat.percentage}% below goal — practice this domain more.
                </p>
              )}
            </div>
          );
        })}
      </div>
      {showPassThreshold && (
        <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 border-r-2 border-dashed border-emerald-600/70" />{" "}
            {DOMAIN_PASS_THRESHOLD}% goal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 border-r border-dashed border-slate-400/40" /> Exam weight
          </span>
        </div>
      )}
    </section>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: ReturnType<typeof getDomainPerformanceStatus>;
  label: string;
}) {
  const styles = {
    good: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    needs_work: "bg-rose-100 text-rose-800 ring-rose-200",
    no_data: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${styles[status]}`}>
      {status === "good" ? "✓ " : status === "needs_work" ? "! " : ""}
      {label}
    </span>
  );
}

interface StudyAdvicePanelProps {
  domainStats: DomainStats[];
  missedQuestions: Question[];
  overallPercentage: number;
}

export function StudyAdvicePanel({
  domainStats,
  missedQuestions,
  overallPercentage,
}: StudyAdvicePanelProps) {
  const advice = generateStudyAdvice(domainStats, missedQuestions, overallPercentage);

  const headerStyles = {
    ready: "from-emerald-500 to-teal-600",
    almost: "from-amber-500 to-orange-500",
    needs_work: "from-rose-500 to-pink-600",
    not_enough_data: "from-slate-500 to-slate-600",
  };

  const weakDomains = advice.domainAdvice.filter((d) => d.status === "needs_work");

  return (
    <section className="glass-card overflow-hidden rounded-3xl">
      <div className={`bg-gradient-to-r ${headerStyles[advice.overallStatus]} px-6 py-5 text-white`}>
        <p className="text-sm font-semibold text-white/80">Study Plan</p>
        <h2 className="mt-1 text-xl font-bold">What To Do Next</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/90">{advice.overallMessage}</p>
      </div>

      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recommended Next Steps</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
            {advice.nextSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {weakDomains.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900">Domains Below {DOMAIN_PASS_THRESHOLD}%</h3>
            <div className="mt-3 space-y-3">
              {weakDomains.map((item) => {
                const domain = DOMAIN_MAP[item.domain];
                return (
                  <div
                    key={item.domain}
                    className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={`font-bold ${domain.color}`}>{item.label}</p>
                      <span className="text-sm font-bold text-rose-700">{item.percentage}%</span>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {item.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                    <Link
                      href={item.practiceHref}
                      className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      Practice {domain.shortLabel} →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {advice.domainAdvice.filter((d) => d.status === "good").length > 0 && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
            <h3 className="text-sm font-bold text-emerald-800">Strong Domains (75%+)</h3>
            <p className="mt-1 text-sm text-emerald-900">
              {advice.domainAdvice
                .filter((d) => d.status === "good")
                .map((d) => `${d.label} (${d.percentage}%)`)
                .join(" · ")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
