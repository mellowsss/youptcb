"use client";

interface ExamReviewScreenProps {
  total: number;
  answeredCount: number;
  flaggedCount: number;
  unansweredNumbers: number[];
  flaggedNumbers: number[];
  onGoToQuestion: (index: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ExamReviewScreen({
  total,
  answeredCount,
  flaggedCount,
  unansweredNumbers,
  flaggedNumbers,
  onGoToQuestion,
  onSubmit,
  onBack,
}: ExamReviewScreenProps) {
  const allAnswered = unansweredNumbers.length === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Review Before Submit</h2>
        <p className="mt-2 text-sm text-slate-600">
          Confirm your answers before ending the exam. You can jump back to any question.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatBox label="Answered" value={`${answeredCount}/${total}`} ok={allAnswered} />
          <StatBox label="Unanswered" value={String(unansweredNumbers.length)} ok={allAnswered} />
          <StatBox label="Flagged" value={String(flaggedCount)} ok />
        </div>

        {!allAnswered && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">Unanswered questions</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {unansweredNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onGoToQuestion(n - 1)}
                  className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-amber-800 ring-1 ring-amber-300 hover:bg-amber-100"
                >
                  Q{n}
                </button>
              ))}
            </div>
          </div>
        )}

        {flaggedNumbers.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">Flagged for review</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {flaggedNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onGoToQuestion(n - 1)}
                  className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                >
                  Q{n}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Exam
          </button>
          <button type="button" onClick={onSubmit} className="btn-primary">
            {allAnswered ? "Submit Exam" : "Submit Anyway"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${
        ok ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-rose-50 ring-1 ring-rose-200"
      }`}
    >
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
