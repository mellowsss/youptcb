"use client";

import { DOMAINS, MOCK_EXAM_SIZE, MOCK_EXAM_TIME_SECONDS } from "@/lib/domains";

interface ExamIntroProps {
  useTimer: boolean;
  onToggleTimer: (value: boolean) => void;
  onStart: () => void;
}

export function ExamIntro({ useTimer, onToggleTimer, onStart }: ExamIntroProps) {
  const minutes = MOCK_EXAM_TIME_SECONDS / 60;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">PTCB Practice Exam</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Take a full-length exam that mirrors the January 2026 PTCE format. No answers or
          explanations are shown until you finish.
        </p>
      </div>

      <div className="glass-card overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
          <p className="text-sm font-semibold text-slate-300">Exam Specifications</p>
          <p className="mt-1 text-2xl font-bold">PTCE Simulation</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <SpecItem label="Questions" value={`${MOCK_EXAM_SIZE}`} />
          <SpecItem label="Time Limit" value={`${minutes} minutes`} />
          <SpecItem label="Format" value="Multiple choice" />
          <SpecItem label="Feedback" value="End of exam only" />
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <h2 className="font-bold text-slate-900">2026 Content Distribution</h2>
        <p className="mt-1 text-sm text-slate-500">
          Questions are weighted to match the official PTCE outline.
        </p>
        <ul className="mt-4 space-y-2">
          {DOMAINS.map((domain) => (
            <li
              key={domain.id}
              className="flex items-center justify-between rounded-xl bg-white/60 px-4 py-2 text-sm"
            >
              <span className={`font-semibold ${domain.color}`}>{domain.label}</span>
              <span className="font-bold text-slate-700">
                {domain.mockExamCount90} questions
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card space-y-4 rounded-3xl p-6">
        <h2 className="font-bold text-slate-900">Exam Rules</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Navigate freely between questions using Previous, Next, or the question grid</li>
          <li>• Flag questions to review before submitting</li>
          <li>• Change answers anytime before final submission</li>
          <li>• The real PTCE includes 80 scored and 10 unscored pretest items — this practice exam scores all {MOCK_EXAM_SIZE} for study purposes</li>
          <li>• Results and explanations appear only after you submit</li>
        </ul>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={useTimer}
            onChange={(e) => onToggleTimer(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
          />
          Enable {minutes}-minute countdown timer (matches real PTCE)
        </label>

        <button type="button" onClick={onStart} className="btn-primary w-full py-4 text-base">
          Start Practice Exam
        </button>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
