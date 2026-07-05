"use client";

import { DOMAIN_MAP, getSubAreaTitle } from "@/lib/domains";
import type { Question } from "@/types/question";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  showFeedback: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  showFeedback,
  onSelect,
  disabled = false,
}: QuestionCardProps) {
  const domain = DOMAIN_MAP[question.domain];
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="glass-card overflow-hidden rounded-3xl">
      <div className={`h-1 bg-gradient-to-r ${domain.gradient}`} style={{ width: `${progress}%` }} />
      <div className="p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            Q{questionNumber}/{totalQuestions}
          </span>
          <span
            className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold text-white ${domain.gradient}`}
          >
            {domain.shortLabel}
          </span>
          <span className="rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs text-slate-500">
            {question.subArea} · {getSubAreaTitle(question.domain, question.subArea)}
          </span>
        </div>

        <p className="mb-6 text-lg font-semibold leading-relaxed text-slate-900 md:text-xl">
          {question.question}
        </p>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = index === question.correctIndex;
            let optionClass =
              "border-slate-200/80 bg-white/70 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm";

            if (showFeedback && isCorrect) {
              optionClass = "border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm";
            } else if (showFeedback && isSelected && !isCorrect) {
              optionClass = "border-rose-400 bg-gradient-to-r from-rose-50 to-pink-50 shadow-sm";
            } else if (isSelected) {
              optionClass = "border-indigo-400 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm";
            }

            return (
              <button
                key={index}
                type="button"
                disabled={disabled || showFeedback}
                onClick={() => onSelect(index)}
                className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition ${optionClass} disabled:cursor-default`}
              >
                <span
                  className={`mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                    showFeedback && isCorrect
                      ? "bg-emerald-500 text-white"
                      : showFeedback && isSelected
                        ? "bg-rose-500 text-white"
                        : isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div
            className={`mt-6 rounded-2xl border p-5 text-sm ${
              selectedIndex === question.correctIndex
                ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900"
                : "border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 text-rose-900"
            }`}
          >
            <p className="text-base font-bold">
              {selectedIndex === question.correctIndex ? "🎉 Correct!" : "❌ Incorrect"}
            </p>
            <p className="mt-2 leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
