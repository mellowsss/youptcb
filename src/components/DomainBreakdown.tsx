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
    <section className="rounded-3xl border border-stone bg-white p-6 shadow-soft md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h2 className="section-title">{title}</h2>
        {showPassThreshold && (
          <p className="text-xs font-medium uppercase tracking-widest text-forest/50">
            Goal: {DOMAIN_PASS_THRESHOLD}%+ per domain
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
              <div className="relative h-4 overflow-hidden rounded-full bg-clay-light">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${
                    status === "good"
                      ? domain.gradient
                      : status === "needs_work"
                        ? "from-terracotta to-clay"
                        : "from-stone to-stone"
                  }`}
                  style={{ width: `${pct}%` }}
                />
                {showPassThreshold && (
                  <div
                    className="absolute inset-y-0 z-10 border-r-2 border-dashed border-sage/80"
                    style={{ left: `${DOMAIN_PASS_THRESHOLD}%` }}
                    title={`${DOMAIN_PASS_THRESHOLD}% goal`}
                  />
                )}
                <div
                  className="absolute inset-y-0 border-r border-dashed border-forest/20"
                  style={{ left: `${Math.round(domain.examWeight * 100)}%` }}
                  title="Exam content weight"
                />
              </div>
              {stat.total > 0 && stat.percentage < DOMAIN_PASS_THRESHOLD && (
                <p className="mt-1.5 text-xs text-terracotta">
                  {DOMAIN_PASS_THRESHOLD - stat.percentage}% below goal — practice this domain more.
                </p>
              )}
            </div>
          );
        })}
      </div>
      {showPassThreshold && (
        <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-medium uppercase tracking-widest text-forest/40">
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 border-r-2 border-dashed border-sage/80" />{" "}
            {DOMAIN_PASS_THRESHOLD}% goal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 border-r border-dashed border-forest/20" /> Exam weight
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
    good: "bg-clay-light text-forest ring-sage/30",
    needs_work: "bg-clay-light text-terracotta ring-terracotta/30",
    no_data: "bg-stone/30 text-forest/50 ring-stone",
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
    ready: "from-forest to-sage",
    almost: "from-terracotta to-clay",
    needs_work: "from-terracotta to-[#A8957A]",
    not_enough_data: "from-forest/80 to-forest/60",
  };

  const weakDomains = advice.domainAdvice.filter((d) => d.status === "needs_work");

  return (
    <section className="overflow-hidden rounded-3xl border border-stone bg-white shadow-soft">
      <div className={`bg-gradient-to-r ${headerStyles[advice.overallStatus]} px-6 py-6 text-white md:px-8 md:py-8`}>
        <p className="text-xs font-medium uppercase tracking-widest text-white/70">Study Plan</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold italic">What To Do Next</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/90">{advice.overallMessage}</p>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        <div>
          <h3 className="font-serif text-lg font-semibold text-forest">Recommended Next Steps</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-forest/80">
            {advice.nextSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {weakDomains.length > 0 && (
          <div>
            <h3 className="font-serif text-lg font-semibold text-forest">
              Domains Below {DOMAIN_PASS_THRESHOLD}%
            </h3>
            <div className="mt-4 space-y-4">
              {weakDomains.map((item) => {
                const domain = DOMAIN_MAP[item.domain];
                return (
                  <div
                    key={item.domain}
                    className="rounded-3xl border border-stone bg-clay-light/50 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={`font-serif font-semibold ${domain.color}`}>{item.label}</p>
                      <span className="text-sm font-semibold text-terracotta">{item.percentage}%</span>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-sm text-forest/80">
                      {item.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                    <Link
                      href={item.practiceHref}
                      className="mt-4 inline-block text-sm font-medium uppercase tracking-widest text-sage transition duration-300 hover:text-terracotta"
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
          <div className="rounded-3xl border border-stone bg-clay-light/30 p-5">
            <h3 className="font-serif text-lg font-semibold text-forest">Strong Domains (75%+)</h3>
            <p className="mt-2 text-sm text-forest/80">
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
