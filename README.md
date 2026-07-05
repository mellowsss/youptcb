# Yousif PTCB

A responsive web app for studying the **January 2026 PTCE** (Pharmacy Technician Certification Exam). Practice with 1050+ questions aligned to the official 2026 content outline domain weights, take weighted mock exams, and review everything you miss.

## Features

- **1050+ questions** tagged by domain and sub-area (2026 PTCE Content Outline v1.4)
- **2026 domain weighting**
  - Medications: 35%
  - Patient Safety & QA: 23.75%
  - Order Entry & Processing: 22.5%
  - Federal Requirements: 18.75%
- **Practice mode** with immediate feedback
- **Mock exam** — 90 questions (32/21/20/17 split) with optional 110-minute timer
- **Missed question review** with explanations and mastery tracking
- **Local progress** saved in your browser (Supabase auth ready for later)
- **Admin page** to flag questions for review

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Regenerating Questions

The question bank lives in `data/questions.json`. To regenerate:

```bash
npm run generate:questions
```

The generator creates 1050 questions distributed across all 2026 sub-areas. If `OPENAI_API_KEY` is set, future AI top-up support can be added to the script.

**Important:** Generated content is for study practice only. Always verify clinical/regulatory facts against current references.

## Project Structure

```
data/questions.json          # Question bank
scripts/generate-questions.ts # Bank generator + validator
src/lib/domains.ts           # 2026 weights and sub-areas
src/lib/exam-builder.ts      # Weighted mock exam assembly
src/lib/scoring.ts           # Score and domain stats
src/lib/progress/            # localStorage repository (Supabase-ready interface)
src/app/                     # Dashboard, practice, exam, review, admin pages
```

## Future: Supabase Auth & Sync

Progress uses a repository interface (`src/lib/progress/repository.ts`). To add accounts later:

1. Create Supabase tables: `profiles`, `answers`, `sessions`, `missed_questions`
2. Implement `SupabaseProgressRepository` with the same interface
3. Swap the provider in `getProgressRepository()` based on auth state

Suggested schema sketch:

```sql
-- answers: user_id, question_id, selected_index, correct, mode, session_id, created_at
-- sessions: id, user_id, mode, question_ids, started_at, completed_at, score
-- missed: user_id, question_id, miss_count, consecutive_correct, mastered
```

## Deploy

Deploy to Vercel or any Next.js host:

```bash
npm run build
npm start
```

## Disclaimer

Yousif PTCB is an independent study tool and is not affiliated with or endorsed by PTCB.
