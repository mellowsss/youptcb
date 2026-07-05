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
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
        No missed questions yet. Great work!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const domain = DOMAIN_MAP[question.domain];
        const selected = selectedAnswers[question.id];

        return (
          <article
            key={question.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${domain.bgColor} ${domain.color}`}>
                {domain.label}
              </span>
              <span className="text-xs text-slate-500">
                {question.subArea} · {getSubAreaTitle(question.domain, question.subArea)}
              </span>
            </div>
            <p className="mb-3 font-medium text-slate-900">{question.question}</p>
            <div className="space-y-2 text-sm">
              {question.options.map((option, index) => {
                const isCorrect = index === question.correctIndex;
                const wasSelected = selected === index;
                return (
                  <p
                    key={index}
                    className={`rounded-lg px-3 py-2 ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-800"
                        : wasSelected
                          ? "bg-red-50 text-red-800"
                          : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </p>
                );
              })}
            </div>
            <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              {question.explanation}
            </p>
            {onMarkMastered && (
              <button
                type="button"
                onClick={() => onMarkMastered(question.id)}
                className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
