"use client";

import type { Question } from "@/types/question";

interface ExamQuestionPanelProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  flagged: boolean;
  onSelect: (index: number) => void;
  onToggleFlag: () => void;
}

export function ExamQuestionPanel({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  flagged,
  onSelect,
  onToggleFlag,
}: ExamQuestionPanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <p className="text-sm font-bold text-slate-700">
          Question {questionNumber} of {totalQuestions}
        </p>
        <button
          type="button"
          onClick={onToggleFlag}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            flagged
              ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
              : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          {flagged ? "Flagged ✓" : "Flag for Review"}
        </button>
      </div>

      <div className="p-5 md:p-6">
        <p className="mb-6 text-base font-medium leading-relaxed text-slate-900 md:text-lg">
          {question.question}
        </p>

        <div className="space-y-2.5">
          {question.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelect(index)}
                className={`flex w-full items-start gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? "border-slate-800 bg-slate-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-medium text-slate-800">{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
