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
  shuffledOptions?: [string, string, string, string];
  shuffledCorrectIndex?: 0 | 1 | 2 | 3;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  showFeedback,
  onSelect,
  disabled = false,
  shuffledOptions,
  shuffledCorrectIndex,
}: QuestionCardProps) {
  const domain = DOMAIN_MAP[question.domain];
  const progress = (questionNumber / totalQuestions) * 100;

  const displayOptions = shuffledOptions ?? question.options;
  const correctIdx = shuffledCorrectIndex ?? question.correctIndex;

  return (
    <div className="overflow-hidden rounded-3xl border border-stone bg-white shadow-soft">
      <div className="h-1 bg-clay-light">
        <div
          className={`h-full bg-gradient-to-r ${domain.gradient} transition-all duration-700 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-clay-light px-3 py-1 text-xs font-medium uppercase tracking-widest text-forest/70">
            Q{questionNumber}/{totalQuestions}
          </span>
          <span
            className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium uppercase tracking-widest text-white ${domain.gradient}`}
          >
            {domain.shortLabel}
          </span>
          <span className="rounded-full border border-stone px-3 py-1 text-xs text-forest/50">
            {question.subArea} · {getSubAreaTitle(question.domain, question.subArea)}
          </span>
        </div>

        <p className="mb-8 font-serif text-xl font-medium leading-relaxed text-forest md:text-2xl">
          {question.question}
        </p>

        <div className="space-y-3">
          {displayOptions.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = index === correctIdx;
            let optionClass =
              "border-stone bg-white hover:border-sage hover:bg-clay-light/50";

            if (showFeedback && isCorrect) {
              optionClass = "border-sage bg-clay-light shadow-soft";
            } else if (showFeedback && isSelected && !isCorrect) {
              optionClass = "border-terracotta bg-clay-light/80 shadow-soft";
            } else if (isSelected) {
              optionClass = "border-forest bg-clay-light shadow-soft";
            }

            return (
              <button
                key={index}
                type="button"
                disabled={disabled || showFeedback}
                onClick={() => onSelect(index)}
                className={`flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left text-sm transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 disabled:cursor-default ${optionClass}`}
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    showFeedback && isCorrect
                      ? "bg-sage text-white"
                      : showFeedback && isSelected
                        ? "bg-terracotta text-white"
                        : isSelected
                          ? "bg-forest text-white"
                          : "bg-clay-light text-forest"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium leading-relaxed text-forest">{option}</span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div
            className={`mt-8 rounded-3xl border p-6 ${
              selectedIndex === correctIdx
                ? "border-sage bg-clay-light text-forest"
                : "border-terracotta/30 bg-clay-light/80 text-forest"
            }`}
          >
            <p className="font-serif text-lg font-semibold italic">
              {selectedIndex === correctIdx ? "Correct" : "Incorrect"}
            </p>
            <p className="mt-3 leading-relaxed text-forest/80">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
