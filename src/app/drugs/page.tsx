"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
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
  DRUG_STUDY_TIPS,
  getAllDrugs,
  getDrugCategories,
  getDrugsByCategory,
  shuffleDrugs,
} from "@/lib/drugs";
import {
  readMasteredDrugIds,
  toggleMasteredDrug,
  writeMasteredDrugIds,
} from "@/lib/drugs-progress";
import type { DrugCategory, TopDrug } from "@/types/drug";

type Mode = "browse" | "flashcards" | "quiz";

const QUIZ_MODES = [
  { id: "generic-to-brand", label: "Generic → Brand" },
  { id: "brand-to-generic", label: "Brand → Generic" },
  { id: "class-match", label: "Drug Class" },
  { id: "indication", label: "Indication" },
] as const;

type QuizMode = (typeof QUIZ_MODES)[number]["id"];

export default function DrugsPage() {
  const allDrugs = getAllDrugs();
  const categories = getDrugCategories();
  const [mode, setMode] = useState<Mode>("browse");
  const [category, setCategory] = useState<DrugCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [mastered, setMastered] = useState<Set<string>>(() => readMasteredDrugIds());
  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>("generic-to-brand");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  const filtered = useMemo(() => {
    let list = getDrugsByCategory(category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.generic.includes(q) ||
          d.brand.toLowerCase().includes(q) ||
          d.drugClass.toLowerCase().includes(q) ||
          d.indication.toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, search]);

  const flashDeck = useMemo(() => shuffleDrugs(filtered), [filtered, mode]);
  const quizDeck = useMemo(() => shuffleDrugs(filtered), [filtered, mode, quizMode]);
  const currentFlash = flashDeck[flashIndex];
  const currentQuiz = quizDeck[quizIndex];

  const quizQuestion = useMemo(() => {
    if (!currentQuiz) return null;
    switch (quizMode) {
      case "generic-to-brand":
        return { prompt: currentQuiz.generic, answer: currentQuiz.brand };
      case "brand-to-generic":
        return { prompt: currentQuiz.brand, answer: currentQuiz.generic };
      case "class-match":
        return { prompt: currentQuiz.generic, answer: currentQuiz.drugClass };
      case "indication":
        return { prompt: currentQuiz.generic, answer: currentQuiz.indication };
    }
  }, [currentQuiz, quizMode]);

  const quizOptions = useMemo(() => {
    if (!quizQuestion || !currentQuiz) return [];
    const pool = allDrugs.filter((d) => d.id !== currentQuiz.id);
    const distractors = shuffleDrugs(pool)
      .slice(0, 3)
      .map((d) => {
        switch (quizMode) {
          case "generic-to-brand":
            return d.brand;
          case "brand-to-generic":
            return d.generic;
          case "class-match":
            return d.drugClass;
          case "indication":
            return d.indication;
        }
      });
    return shuffleDrugs([quizQuestion.answer, ...distractors]);
  }, [quizQuestion, currentQuiz, quizMode, allDrugs]);

  const masteredCount = mastered.size;
  const progressPct = Math.round((masteredCount / allDrugs.length) * 100);

  const toggleMastered = (id: string) => {
    setMastered(toggleMasteredDrug(id));
  };

  const resetMastered = () => {
    writeMasteredDrugIds(new Set());
    setMastered(new Set());
  };

  const handleQuizSelect = (option: string) => {
    if (!quizQuestion || showQuizFeedback) return;
    setSelectedAnswer(option);
    setShowQuizFeedback(true);
    const correct = option === quizQuestion.answer;
    setQuizScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    if (correct && currentQuiz) {
      const next = new Set(mastered);
      next.add(currentQuiz.id);
      writeMasteredDrugIds(next);
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
            2026 PTCE · Medications Domain
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight md:text-6xl">
            Top <em className="text-sage">200</em> Drugs
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
            Master the most-tested generic/brand names, drug classes, and indications for the
            2026 exam. Browse, flashcard, and quiz your way through all {allDrugs.length} drugs.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-white/15 px-4 py-2">
              {masteredCount}/{allDrugs.length} mastered ({progressPct}%)
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2">
              {categories.length} categories
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {DRUG_STUDY_TIPS.slice(0, 3).map((tip) => (
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
              mode === id ? "bg-forest text-white shadow-soft" : "bg-white text-forest ring-1 ring-stone hover:bg-clay-light"
            }`}
          >
            <Icon strokeWidth={1.5} className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="Search generic, brand, class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-stone bg-white py-3 pl-11 pr-4 text-sm text-forest focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as DrugCategory | "all")}
          className="rounded-full border border-stone bg-white px-4 py-3 text-sm text-forest focus:border-sage focus:outline-none"
        >
          <option value="all">All categories</option>
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
          {filtered.map((drug, i) => (
            <DrugCard
              key={drug.id}
              drug={drug}
              stagger={i % 2 === 1}
              mastered={mastered.has(drug.id)}
              onToggleMastered={() => toggleMastered(drug.id)}
            />
          ))}
        </div>
      )}

      {mode === "flashcards" && currentFlash && (
        <div className="mx-auto max-w-xl">
          <Flashcard
            drug={currentFlash}
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

      {mode === "quiz" && quizQuestion && currentQuiz && (
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-wrap gap-2">
            {QUIZ_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setQuizMode(m.id);
                  setQuizIndex(0);
                  setQuizScore({ correct: 0, total: 0 });
                  setShowQuizFeedback(false);
                }}
                className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest ${
                  quizMode === m.id ? "bg-forest text-white" : "bg-clay-light text-forest"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <Card>
            <p className="text-xs font-medium uppercase tracking-widest text-sage">
              Question {quizIndex + 1} · Score {quizScore.correct}/{quizScore.total}
            </p>
            <p className="mt-4 font-serif text-2xl font-semibold text-forest">{quizQuestion.prompt}</p>
            <div className="mt-6 space-y-3">
              {quizOptions.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === quizQuestion.answer;
                let cls = "border-stone bg-white hover:border-sage hover:bg-clay-light/50";
                if (showQuizFeedback && isCorrect) cls = "border-sage bg-clay-light";
                if (showQuizFeedback && isSelected && !isCorrect) cls = "border-terracotta bg-clay-light/80";

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
                <p className="font-semibold text-forest">{currentQuiz.drugClass}</p>
                <p className="mt-1">{currentQuiz.indication}</p>
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
          Best Way to Learn (2026)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DRUG_STUDY_TIPS.map((tip, i) => (
            <div key={tip} className="rounded-2xl border border-stone bg-white px-5 py-4 text-sm text-forest/80">
              <span className="mr-2 font-serif font-semibold text-sage">{i + 1}.</span>
              {tip}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DrugCard({
  drug,
  stagger,
  mastered,
  onToggleMastered,
}: {
  drug: TopDrug;
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
          <p className="font-serif text-lg font-semibold text-forest">{drug.generic}</p>
          <p className="text-sm text-sage">{drug.brand}</p>
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
      <p className="mt-3 text-xs font-medium uppercase tracking-widest text-forest/50">{drug.drugClass}</p>
      <p className="mt-1 text-sm text-forest/80">{drug.indication}</p>
      <p className="mt-3 rounded-xl bg-clay-light/60 p-3 text-xs leading-relaxed text-forest/70">
        {drug.ptceTip}
      </p>
      <span className="mt-3 inline-block rounded-full bg-stone/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-forest/50">
        {drug.category}
      </span>
    </article>
  );
}

function Flashcard({
  drug,
  flipped,
  onFlip,
  index,
  total,
}: {
  drug: TopDrug;
  flipped: boolean;
  onFlip: () => void;
  index: number;
  total: number;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="w-full rounded-3xl border border-stone bg-white p-8 text-left shadow-large transition duration-500 ease-out hover:-translate-y-1 min-h-[320px]"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-sage">
        Card {index + 1} of {total} · Tap to flip
      </p>
      {!flipped ? (
        <div className="mt-8">
          <p className="font-serif text-3xl font-semibold text-forest md:text-4xl">{drug.generic}</p>
          <p className="mt-4 text-sm text-forest/50">What is the brand name and class?</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-xl font-semibold text-sage">{drug.brand}</p>
          <p className="text-sm font-medium text-forest">{drug.drugClass}</p>
          <p className="text-sm text-forest/80">{drug.indication}</p>
          <p className="rounded-xl bg-clay-light p-3 text-sm text-forest/70">{drug.ptceTip}</p>
        </div>
      )}
    </button>
  );
}
