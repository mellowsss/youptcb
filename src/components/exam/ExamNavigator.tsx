"use client";

interface ExamNavigatorProps {
  total: number;
  currentIndex: number;
  answeredSet: Set<number>;
  flaggedSet: Set<number>;
  onJump: (index: number) => void;
}

export function ExamNavigator({
  total,
  currentIndex,
  answeredSet,
  flaggedSet,
  onJump,
}: ExamNavigatorProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Question Navigator</span>
        <span>
          {answeredSet.size}/{total} answered
        </span>
      </div>
      <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-15">
        {Array.from({ length: total }, (_, i) => {
          const answered = answeredSet.has(i);
          const flagged = flaggedSet.has(i);
          const current = i === currentIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump(i)}
              className={`relative flex h-8 w-full items-center justify-center rounded-md text-xs font-bold transition ${
                current
                  ? "bg-slate-900 text-white ring-2 ring-indigo-400"
                  : answered
                    ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {i + 1}
              {flagged && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-medium text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-900" /> Current
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-300" /> Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Flagged
        </span>
      </div>
    </div>
  );
}
