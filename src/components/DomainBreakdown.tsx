"use client";

import { DOMAIN_MAP } from "@/lib/domains";
import type { DomainStats } from "@/types/question";

interface DomainBreakdownProps {
  stats: DomainStats[];
  title?: string;
}

export function DomainBreakdown({ stats, title = "Performance by Domain" }: DomainBreakdownProps) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <h2 className="mb-5 text-lg font-bold text-slate-900">{title}</h2>
      <div className="space-y-5">
        {stats.map((stat) => {
          const domain = DOMAIN_MAP[stat.domain];
          const pct = stat.total > 0 ? stat.percentage : 0;
          return (
            <div key={stat.domain}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className={`font-bold ${domain.color}`}>{domain.label}</span>
                <span className="font-medium text-slate-600">
                  {stat.correct}/{stat.total} ({stat.percentage}%) · target{" "}
                  {Math.round(domain.examWeight * 100)}%
                </span>
              </div>
              <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${domain.gradient} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute inset-y-0 border-r-2 border-dashed border-slate-400/60"
                  style={{ left: `${Math.round(domain.examWeight * 100)}%` }}
                  title="Exam weight marker"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
