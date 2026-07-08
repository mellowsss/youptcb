-- Yousif PTCB cloud sync tables
CREATE TABLE IF NOT EXISTS public.ptcb_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ptcb_profiles_username_unique UNIQUE (username),
  CONSTRAINT ptcb_profiles_username_format CHECK (username ~ '^[a-z0-9_]{3,20}$')
);

CREATE TABLE IF NOT EXISTS public.ptcb_progress (
  profile_id UUID PRIMARY KEY REFERENCES public.ptcb_profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  missed JSONB NOT NULL DEFAULT '[]'::jsonb,
  sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
  flagged_question_ids TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ptcb_profiles_username_idx ON public.ptcb_profiles (username);

ALTER TABLE public.ptcb_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptcb_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ptcb_profiles_select" ON public.ptcb_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ptcb_profiles_insert" ON public.ptcb_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "ptcb_profiles_update" ON public.ptcb_profiles FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "ptcb_progress_all" ON public.ptcb_progress FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
