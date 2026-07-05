import { DOMAINS, getSubAreaTitle } from "@/lib/domains";
import type { DomainId, DomainStats, Question } from "@/types/question";

export const DOMAIN_PASS_THRESHOLD = 75;
export const OVERALL_PASS_THRESHOLD = 75;

export type DomainPerformanceStatus = "good" | "needs_work" | "no_data";

export interface DomainAdvice {
  domain: DomainId;
  label: string;
  percentage: number;
  status: DomainPerformanceStatus;
  priority: "high" | "medium" | "low";
  tips: string[];
  weakSubAreas: string[];
  practiceHref: string;
}

export interface StudyAdvice {
  overallStatus: "ready" | "almost" | "needs_work" | "not_enough_data";
  overallMessage: string;
  domainAdvice: DomainAdvice[];
  nextSteps: string[];
}

const DOMAIN_TIPS: Record<DomainId, string[]> = {
  medications: [
    "Review generic/brand name pairs and drug classifications daily.",
    "Focus on high-yield interactions, contraindications, and side effects.",
    "Practice dose/strength questions and proper storage requirements.",
  ],
  federal: [
    "Memorize DEA schedules and controlled substance refill rules.",
    "Study DSCSA, REMS, pseudoephedrine limits, and FDA recall classes.",
    "Review hazardous waste handling and disposal requirements.",
  ],
  patient_safety: [
    "Learn high-alert and LASA drug pairs used in pharmacies.",
    "Review error prevention: Tall Man lettering, leading zeros, bar codes.",
    "Know when pharmacist intervention is required (DUR, ADE, allergies).",
  ],
  order_entry: [
    "Drill sig codes, days' supply, and basic pharmacy calculations.",
    "Practice NDC, lot number, and expiration date scenarios.",
    "Review return-to-stock, credit return, and reverse distribution rules.",
  ],
};

export function getDomainPerformanceStatus(stat: DomainStats): DomainPerformanceStatus {
  if (stat.total === 0) return "no_data";
  return stat.percentage >= DOMAIN_PASS_THRESHOLD ? "good" : "needs_work";
}

export function getDomainStatusLabel(status: DomainPerformanceStatus): string {
  switch (status) {
    case "good":
      return "Good";
    case "needs_work":
      return "Needs Study";
    case "no_data":
      return "Not Tested";
  }
}

export function generateStudyAdvice(
  domainStats: DomainStats[],
  missedQuestions: Question[],
  overallPercentage: number
): StudyAdvice {
  const missedByDomain = new Map<DomainId, Question[]>();
  for (const q of missedQuestions) {
    const list = missedByDomain.get(q.domain) ?? [];
    list.push(q);
    missedByDomain.set(q.domain, list);
  }

  const domainAdvice: DomainAdvice[] = DOMAINS.map((domainConfig) => {
    const stat = domainStats.find((s) => s.domain === domainConfig.id)!;
    const status = getDomainPerformanceStatus(stat);
    const missed = missedByDomain.get(domainConfig.id) ?? [];

    const subAreaCounts = new Map<string, number>();
    for (const q of missed) {
      subAreaCounts.set(q.subArea, (subAreaCounts.get(q.subArea) ?? 0) + 1);
    }
    const weakSubAreas = [...subAreaCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([subArea]) => `${subArea} · ${getSubAreaTitle(domainConfig.id, subArea)}`);

    const gap = DOMAIN_PASS_THRESHOLD - stat.percentage;
    let priority: DomainAdvice["priority"] = "low";
    if (status === "needs_work" && stat.total > 0) {
      priority = gap >= 25 || domainConfig.examWeight >= 0.3 ? "high" : "medium";
    } else if (status === "no_data" && domainConfig.examWeight >= 0.25) {
      priority = "medium";
    }

    const tips = [...DOMAIN_TIPS[domainConfig.id]];
    if (weakSubAreas.length > 0) {
      tips.unshift(`Focus on missed sub-areas: ${weakSubAreas.join("; ")}.`);
    }
    if (status === "good") {
      tips.unshift(`Strong domain — maintain with occasional review (goal: ${DOMAIN_PASS_THRESHOLD}%+).`);
    }

    return {
      domain: domainConfig.id,
      label: domainConfig.label,
      percentage: stat.percentage,
      status,
      priority,
      tips: tips.slice(0, 3),
      weakSubAreas,
      practiceHref: `/practice?domain=${domainConfig.id}`,
    };
  }).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.percentage - b.percentage;
  });

  const testedDomains = domainStats.filter((s) => s.total > 0);
  const weakDomains = domainAdvice.filter((d) => d.status === "needs_work" && d.percentage >= 0);
  const goodDomains = domainAdvice.filter((d) => d.status === "good");

  let overallStatus: StudyAdvice["overallStatus"];
  let overallMessage: string;

  if (testedDomains.length === 0) {
    overallStatus = "not_enough_data";
    overallMessage = "Complete more questions to get personalized study advice.";
  } else if (
    overallPercentage >= OVERALL_PASS_THRESHOLD &&
    weakDomains.length === 0
  ) {
    overallStatus = "ready";
    overallMessage = `Great job! You hit ${OVERALL_PASS_THRESHOLD}%+ overall and in every tested domain. Keep reviewing weak sub-areas before exam day.`;
  } else if (overallPercentage >= OVERALL_PASS_THRESHOLD - 10) {
    overallStatus = "almost";
    overallMessage = `You're close. Aim for ${OVERALL_PASS_THRESHOLD}% in each domain — especially high-weight areas like Medications (35%).`;
  } else {
    overallStatus = "needs_work";
    overallMessage = `Build toward ${OVERALL_PASS_THRESHOLD}% correct in each domain. Prioritize weak areas below before your next mock exam.`;
  }

  const nextSteps: string[] = [];
  if (weakDomains.length > 0) {
    nextSteps.push(
      `Practice ${weakDomains[0].label} first — you scored ${weakDomains[0].percentage}% (goal: ${DOMAIN_PASS_THRESHOLD}%).`
    );
    if (weakDomains[0].weakSubAreas[0]) {
      nextSteps.push(`Review missed topic: ${weakDomains[0].weakSubAreas[0]}.`);
    }
  }
  if (missedQuestions.length > 0) {
    nextSteps.push(`Re-quiz your ${missedQuestions.length} missed question(s) in Review Missed.`);
  }
  nextSteps.push("Take another full mock exam once weak domains are at 75%+.");
  if (goodDomains.length > 0 && weakDomains.length > 0) {
    nextSteps.push(
      `Keep ${goodDomains.map((d) => d.label).join(" & ")} sharp with short daily drills.`
    );
  }

  return {
    overallStatus,
    overallMessage,
    domainAdvice,
    nextSteps: nextSteps.slice(0, 4),
  };
}

export function getPerformanceColor(percentage: number, total: number): string {
  if (total === 0) return "text-slate-400";
  if (percentage >= DOMAIN_PASS_THRESHOLD) return "text-emerald-700";
  if (percentage >= DOMAIN_PASS_THRESHOLD - 15) return "text-amber-700";
  return "text-rose-700";
}

export function getOverallScoreGradient(percentage: number): string {
  if (percentage >= OVERALL_PASS_THRESHOLD) return "from-emerald-500 to-teal-600";
  if (percentage >= OVERALL_PASS_THRESHOLD - 15) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-pink-600";
}
