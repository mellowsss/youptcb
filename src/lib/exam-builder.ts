import { DOMAINS, MOCK_EXAM_SIZE } from "@/lib/domains";
import { getActiveQuestions, shuffleQuestions } from "@/lib/questions";
import type { DomainId, Question } from "@/types/question";

function pickQuestions(
  pool: Question[],
  count: number,
  usedIds: Set<string>
): Question[] {
  const available = shuffleQuestions(pool.filter((q) => !usedIds.has(q.id)));
  const selected = available.slice(0, count);
  selected.forEach((q) => usedIds.add(q.id));
  return selected;
}

export function buildMockExam(excludedIds: string[] = []): Question[] {
  const excluded = new Set(excludedIds);
  const allQuestions = getActiveQuestions().filter((q) => !excluded.has(q.id));
  const usedIds = new Set<string>();
  const examQuestions: Question[] = [];

  for (const domain of DOMAINS) {
    const domainPool = allQuestions.filter((q) => q.domain === domain.id);
    const selected = pickQuestions(domainPool, domain.mockExamCount90, usedIds);
    examQuestions.push(...selected);
  }

  if (examQuestions.length < MOCK_EXAM_SIZE) {
    const remaining = MOCK_EXAM_SIZE - examQuestions.length;
    const filler = pickQuestions(
      allQuestions.filter((q) => !usedIds.has(q.id)),
      remaining,
      usedIds
    );
    examQuestions.push(...filler);
  }

  return shuffleQuestions(examQuestions);
}

export function buildPracticeSet(options: {
  domain?: DomainId;
  subArea?: string;
  count?: number;
  weighted?: boolean;
  excludedIds?: string[];
}): Question[] {
  const { domain, subArea, count = 20, weighted = true, excludedIds = [] } = options;
  const excluded = new Set(excludedIds);
  let pool = getActiveQuestions().filter((q) => !excluded.has(q.id));

  if (domain && subArea) {
    pool = pool.filter((q) => q.domain === domain && q.subArea === subArea);
  } else if (domain) {
    pool = pool.filter((q) => q.domain === domain);
  }

  if (pool.length <= count) {
    return shuffleQuestions(pool);
  }

  if (!weighted || domain) {
    return pickQuestions(pool, count, new Set());
  }

  const selected: Question[] = [];
  const usedIds = new Set<string>();

  for (const domainConfig of DOMAINS) {
    const domainCount = Math.max(1, Math.round(count * domainConfig.examWeight));
    const domainPool = pool.filter((q) => q.domain === domainConfig.id);
    selected.push(...pickQuestions(domainPool, domainCount, usedIds));
  }

  if (selected.length > count) {
    return shuffleQuestions(selected.slice(0, count));
  }

  if (selected.length < count) {
    selected.push(
      ...pickQuestions(
        pool.filter((q) => !usedIds.has(q.id)),
        count - selected.length,
        usedIds
      )
    );
  }

  return shuffleQuestions(selected);
}

export function buildReviewSet(questionIds: string[]): Question[] {
  const allQuestions = getActiveQuestions();
  const idSet = new Set(questionIds);
  return shuffleQuestions(allQuestions.filter((q) => idSet.has(q.id)));
}
