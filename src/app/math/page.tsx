"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Layers,
  Lightbulb,
  List,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  MATH_STUDY_TIPS,
  getAllMathProblems,
  getMathByCategory,
  getMathCategories,
  shuffleMath,
} from "@/lib/math";
import {
  readMasteredMathIds,
  toggleMasteredMath,
  writeMasteredMathIds,
} from "@/lib/math-progress";
import type { MathCategory, MathProblem } from "@/types/math";

type Mode = "browse" | "flashcards" | "quiz";

export default function PharmacyMathPage() {
  const allProblems = getAllMathProblems();
  const categories = getMathCategories();
  const [mode, setMode] = useState<Mode>("browse");
  const [category, setCategory] = useState<MathCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [mastered, setMastered] = useState<Set<string>>(() => readMasteredMathIds());
  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  const filtered = useMemo(() => {
    let list = getMathByCategory(category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.formula.toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, search]);

  const flashDeck = useMemo(() => shuffleMath(filtered), [filtered, mode]);
  const quizDeck = useMemo(() => shuffleMath(filtered), [filtered, mode]);
  const currentFlash = flashDeck[flashIndex];
  const currentQuiz = quizDeck[quizIndex];

  const quizOptions = useMemo(() => {
    if (!currentQuiz) return [];
    return shuffleMath([currentQuiz.answer, ...currentQuiz.distractors]);
  }, [currentQuiz]);

  const masteredCount = mastered.size;
  const progressPct = Math.round((masteredCount / allProblems.length) * 100);

  const toggleMastered = (id: string) => {
    setMastered(toggleMasteredMath(id));
  };

  const resetMastered = () => {
    writeMasteredMathIds(new Set());
    setMastered(new Set());
  };

  const handleQuizSelect = (option: string) => {
    if (!currentQuiz || showQuizFeedback) return;
    setSelectedAnswer(option);
    setShowQuizFeedback(true);
    const correct = option === currentQuiz.answer;
    setQuizScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    if (correct) {
      const next = new Set(mastered);
      next.add(currentQuiz.id);
      writeMasteredMathIds(next);
      setMastered(next);
    }
  };

  const nextQuiz = () => {
    setSelectedAnswer(null);
    setShowQuizFeedback(false);
    setQuizIndex((i) => (i + 1 >= quizDeck.length ? 0 : i + 1));
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-forest px-6 py-10 text-white shadow-xl md:px-10 md:py-14">
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            2026 PTCE · Order Entry 22.5%
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight md:text-6xl">
            Pharmacy <em className="text-sage">Math</em>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
            Drill days&apos; supply, conversions, dilutions, percent strength, weight-based dosing,
            and IV rates — the calculation skills tested on the 2026 PTCE.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-white/15 px-4 py-2">
              {masteredCount}/{allProblems.length} mastered ({progressPct}%)
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2">
              {categories.length} topic groups
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {MATH_STUDY_TIPS.slice(0, 3).map((tip) => (
          <Card key={tip} clay className="flex gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" strokeWidth={1.5} />
            <p className="text-sm leading-relaxed text-forest/80">{tip}</p>
          </Card>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "browse", label: "Browse", Icon: List },
            { id: "flashcards", label: "Flashcards", Icon: Layers },
            { id: "quiz", label: "Quiz", Icon: Brain },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              setFlashIndex(0);
              setFlipped(false);
              setQuizIndex(0);
              setQuizScore({ correct: 0, total: 0 });
              setShowQuizFeedback(false);
            }}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition duration-300 ${
              mode === id
                ? "bg-forest text-white shadow-soft"
                : "bg-white text-forest ring-1 ring-stone hover:bg-clay-light"
            }`}
          >
            <Icon strokeWidth={1.5} className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40"
            strokeWidth={1.5}
          />
          <input
            type="search"
            placeholder="Search formulas, topics, prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-stone bg-white py-3 pl-11 pr-4 text-sm text-forest focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as MathCategory | "all")}
          className="rounded-full border border-stone bg-white px-4 py-3 text-sm text-forest focus:border-sage focus:outline-none"
        >
          <option value="all">All topics</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={resetMastered}
          className="inline-flex items-center gap-2 rounded-full border border-stone bg-white px-4 py-3 text-xs font-medium uppercase tracking-widest text-forest/70 hover:bg-clay-light"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
          Reset mastered
        </button>
      </div>

      {mode === "browse" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((problem, i) => (
            <MathCard
              key={problem.id}
              problem={problem}
              stagger={i % 2 === 1}
              mastered={mastered.has(problem.id)}
              onToggleMastered={() => toggleMastered(problem.id)}
            />
          ))}
        </div>
      )}

      {mode === "flashcards" && currentFlash && (
        <div className="mx-auto max-w-xl">
          <MathFlashcard
            problem={currentFlash}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
            index={flashIndex}
            total={flashDeck.length}
          />
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setFlashIndex((i) => Math.max(0, i - 1));
                setFlipped(false);
              }}
              disabled={flashIndex === 0}
              className="inline-flex items-center gap-2 rounded-full border border-stone bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              type="button"
              onClick={() => toggleMastered(currentFlash.id)}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest ${
                mastered.has(currentFlash.id) ? "bg-sage text-white" : "bg-clay-light text-forest"
              }`}
            >
              {mastered.has(currentFlash.id) ? "Mastered" : "Mark mastered"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFlashIndex((i) => Math.min(flashDeck.length - 1, i + 1));
                setFlipped(false);
              }}
              disabled={flashIndex >= flashDeck.length - 1}
              className="inline-flex items-center gap-2 rounded-full border border-stone bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {mode === "quiz" && currentQuiz && (
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <p className="text-xs font-medium uppercase tracking-widest text-sage">
              Question {quizIndex + 1} · Score {quizScore.correct}/{quizScore.total} ·{" "}
              {currentQuiz.category}
            </p>
            <p className="mt-4 font-serif text-2xl font-semibold text-forest">
              {currentQuiz.prompt}
            </p>
            <p className="mt-2 text-sm text-forest/50">Formula cue: {currentQuiz.formula}</p>
            <div className="mt-6 space-y-3">
              {quizOptions.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuiz.answer;
                let cls = "border-stone bg-white hover:border-sage hover:bg-clay-light/50";
                if (showQuizFeedback && isCorrect) cls = "border-sage bg-clay-light";
                if (showQuizFeedback && isSelected && !isCorrect) {
                  cls = "border-terracotta bg-clay-light/80";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={showQuizFeedback}
                    onClick={() => handleQuizSelect(option)}
                    className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition duration-300 ${cls}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {showQuizFeedback && (
              <div className="mt-6 rounded-2xl bg-clay-light p-4 text-sm text-forest/80">
                <p className="font-semibold text-forest">{currentQuiz.explanation}</p>
                <p className="mt-2 text-terracotta">{currentQuiz.ptceTip}</p>
              </div>
            )}
          </Card>

          {showQuizFeedback && (
            <div className="flex justify-end">
              <Button type="button" onClick={nextQuiz}>
                Next Question
              </Button>
            </div>
          )}
        </div>
      )}

      <section>
        <h2 className="section-title mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sage" strokeWidth={1.5} />
          Best Way to Learn Math (2026)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MATH_STUDY_TIPS.map((tip, i) => (
            <div
              key={tip}
              className="rounded-2xl border border-stone bg-white px-5 py-4 text-sm text-forest/80"
            >
              <span className="mr-2 font-serif font-semibold text-sage">{i + 1}.</span>
              {tip}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MathCard({
  problem,
  stagger,
  mastered,
  onToggleMastered,
}: {
  problem: MathProblem;
  stagger: boolean;
  mastered: boolean;
  onToggleMastered: () => void;
}) {
  return (
    <article
      className={`botanical-card-hover rounded-3xl border border-stone bg-white p-5 shadow-soft transition duration-500 ${
        stagger ? "md:translate-y-4" : ""
      } ${mastered ? "ring-2 ring-sage/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-serif text-lg font-semibold text-forest">{problem.title}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-sage">
            {problem.category}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleMastered}
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
            mastered ? "bg-sage text-white" : "bg-clay-light text-forest/60"
          }`}
        >
          {mastered ? "✓" : "Learn"}
        </button>
      </div>
      <p className="mt-3 flex items-start gap-2 text-sm text-forest/80">
        <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" strokeWidth={1.5} />
        {problem.formula}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-forest/70">{problem.prompt}</p>
      <p className="mt-3 rounded-xl bg-clay-light/60 p-3 text-xs leading-relaxed text-forest/70">
        <span className="font-semibold text-forest">Answer: </span>
        {problem.answer}
        <br />
        {problem.explanation}
      </p>
    </article>
  );
}

function MathFlashcard({
  problem,
  flipped,
  onFlip,
  index,
  total,
}: {
  problem: MathProblem;
  flipped: boolean;
  onFlip: () => void;
  index: number;
  total: number;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="min-h-[320px] w-full rounded-3xl border border-stone bg-white p-8 text-left shadow-large transition duration-500 ease-out hover:-translate-y-1"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-sage">
        Card {index + 1} of {total} · {problem.category} · Tap to flip
      </p>
      {!flipped ? (
        <div className="mt-8">
          <p className="font-serif text-2xl font-semibold text-forest md:text-3xl">
            {problem.prompt}
          </p>
          <p className="mt-4 text-sm text-forest/50">Formula: {problem.formula}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-xl font-semibold text-sage">{problem.answer}</p>
          <p className="text-sm text-forest/80">{problem.explanation}</p>
          <p className="rounded-xl bg-clay-light p-3 text-sm text-forest/70">{problem.ptceTip}</p>
        </div>
      )}
    </button>
  );
}
