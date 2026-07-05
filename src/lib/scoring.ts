import { DOMAIN_MAP } from "@/lib/domains";
import { getQuestionById } from "@/lib/questions";
import type {
  AnswerRecord,
  DomainId,
  DomainStats,
  Question,
  SessionScore,
} from "@/types/question";

export function scoreSession(
  questionIds: string[],
  answers: AnswerRecord[]
): SessionScore {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));
  const domainTotals: Record<DomainId, { total: number; correct: number }> = {
    medications: { total: 0, correct: 0 },
    federal: { total: 0, correct: 0 },
    patient_safety: { total: 0, correct: 0 },
    order_entry: { total: 0, correct: 0 },
  };

  let correct = 0;
  const missedQuestions: Question[] = [];

  for (const questionId of questionIds) {
    const question = getQuestionById(questionId);
    const answer = answerMap.get(questionId);
    if (!question || !answer) continue;

    domainTotals[question.domain].total++;
    if (answer.correct) {
      correct++;
      domainTotals[question.domain].correct++;
    } else {
      missedQuestions.push(question);
    }
  }

  const total = questionIds.length;
  const domainStats: DomainStats[] = (Object.keys(domainTotals) as DomainId[]).map(
    (domain) => {
      const stats = domainTotals[domain];
      return {
        domain,
        total: stats.total,
        correct: stats.correct,
        percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        examWeight: DOMAIN_MAP[domain].examWeight,
      };
    }
  );

  return {
    total,
    correct,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    domainStats,
    missedQuestions,
  };
}

export function getOverallStats(answers: AnswerRecord[]): {
  totalAnswered: number;
  totalCorrect: number;
  percentage: number;
  domainStats: DomainStats[];
} {
  const uniqueAnswers = new Map<string, AnswerRecord>();
  for (const answer of answers) {
    const existing = uniqueAnswers.get(answer.questionId);
    if (!existing || answer.timestamp > existing.timestamp) {
      uniqueAnswers.set(answer.questionId, answer);
    }
  }

  const questionIds = Array.from(uniqueAnswers.keys());
  const score = scoreSession(questionIds, Array.from(uniqueAnswers.values()));

  return {
    totalAnswered: score.total,
    totalCorrect: score.correct,
    percentage: score.percentage,
    domainStats: score.domainStats,
  };
}
