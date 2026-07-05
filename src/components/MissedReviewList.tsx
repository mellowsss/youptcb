"use client";

import { DOMAIN_MAP, getSubAreaTitle } from "@/lib/domains";
import type { Question } from "@/types/question";

interface MissedReviewListProps {
  questions: Question[];
  selectedAnswers?: Record<string, number>;
  onMarkMastered?: (questionId: string) => void;
}

export function MissedReviewList({
  questions,
  selectedAnswers = {},
  onMarkMastered,
}: MissedReviewListProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone bg-white p-10 text-center text-forest/50">
        No missed questions yet. Great work!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => {
        const domain = DOMAIN_MAP[question.domain];
        const selected = selectedAnswers[question.id];

        return (
          <article
            key={question.id}
            className="rounded-3xl border border-stone bg-white p-6 shadow-soft md:p-8"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest ${domain.bgColor} ${domain.color}`}>
                {domain.label}
              </span>
              <span className="text-xs text-forest/50">
                {question.subArea} · {getSubAreaTitle(question.domain, question.subArea)}
              </span>
            </div>
            <p className="mb-4 font-serif text-lg font-medium text-forest">{question.question}</p>
            <div className="space-y-2 text-sm">
              {question.options.map((option, index) => {
                const isCorrect = index === question.correctIndex;
                const wasSelected = selected === index;
                return (
                  <p
                    key={index}
                    className={`rounded-2xl px-4 py-3 ${
                      isCorrect
                        ? "bg-clay-light text-forest"
                        : wasSelected
                          ? "bg-clay-light/80 text-terracotta"
                          : "bg-stone/20 text-forest/80"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </p>
                );
              })}
            </div>
            <p className="mt-4 rounded-3xl bg-clay-light p-4 text-sm leading-relaxed text-forest/80">
              {question.explanation}
            </p>
            {onMarkMastered && (
              <button
                type="button"
                onClick={() => onMarkMastered(question.id)}
                className="mt-4 rounded-full border border-stone px-4 py-2 text-sm font-medium uppercase tracking-widest text-forest transition duration-300 hover:bg-clay-light"
              >
                Mark as mastered
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
