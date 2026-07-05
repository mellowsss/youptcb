"use client";

import { useMemo, useState } from "react";
import { DOMAIN_MAP, DOMAINS, getSubAreaTitle } from "@/lib/domains";
import { getAllQuestions } from "@/lib/questions";
import { getProgressRepository } from "@/lib/progress/local-storage";
import type { DomainId, Question } from "@/types/question";

export default function AdminReviewPage() {
  const repo = getProgressRepository();
  const [questions, setQuestions] = useState<Question[]>(() => getAllQuestions());
  const [domainFilter, setDomainFilter] = useState<DomainId | "all">("all");
  const [search, setSearch] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const flaggedIds = useMemo(() => new Set(repo.getFlaggedQuestionIds()), [questions]);

  const filtered = questions.filter((q) => {
    if (domainFilter !== "all" && q.domain !== domainFilter) return false;
    if (flaggedOnly && !flaggedIds.has(q.id)) return false;
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleFlag = (questionId: string) => {
    const isFlagged = flaggedIds.has(questionId);
    repo.updateQuestionFlag(questionId, !isFlagged);
    setQuestions(getAllQuestions());
  };

  const counts = DOMAINS.map((domain) => ({
    ...domain,
    count: questions.filter((q) => q.domain === domain.id).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Question Admin</h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse and flag AI-generated questions that need review. Flagged questions are excluded
          from exams and practice.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {counts.map((domain) => (
          <div key={domain.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className={`text-sm font-semibold ${domain.color}`}>{domain.label}</p>
            <p className="text-2xl font-bold">{domain.count}</p>
            <p className="text-xs text-slate-500">Target {domain.bankTarget1050}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search question text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[220px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value as DomainId | "all")}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="all">All domains</option>
          {DOMAINS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => setFlaggedOnly(e.target.checked)}
          />
          Flagged only
        </label>
      </div>

      <p className="text-sm text-slate-500">
        Showing {filtered.length} of {questions.length} questions · {flaggedIds.size} flagged
      </p>

      <div className="space-y-4">
        {filtered.slice(0, 100).map((question) => {
          const domain = DOMAIN_MAP[question.domain];
          const flagged = flaggedIds.has(question.id);
          return (
            <article
              key={question.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                flagged ? "border-amber-300" : "border-slate-200"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400">{question.id}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${domain.bgColor} ${domain.color}`}>
                  {domain.shortLabel}
                </span>
                <span className="text-xs text-slate-500">
                  {question.subArea} · {getSubAreaTitle(question.domain, question.subArea)}
                </span>
              </div>
              <p className="font-medium text-slate-900">{question.question}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {question.options.map((option, index) => (
                  <li
                    key={index}
                    className={index === question.correctIndex ? "font-semibold text-emerald-700" : ""}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {question.explanation}
              </p>
              <button
                type="button"
                onClick={() => toggleFlag(question.id)}
                className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  flagged
                    ? "bg-amber-100 text-amber-800"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {flagged ? "Unflag question" : "Flag for review"}
              </button>
            </article>
          );
        })}
      </div>

      {filtered.length > 100 && (
        <p className="text-sm text-slate-500">
          Showing first 100 results. Use search or filters to narrow down.
        </p>
      )}
    </div>
  );
}
