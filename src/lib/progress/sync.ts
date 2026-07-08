import { getSupabaseClient } from "@/lib/supabase/client";
import type { ProgressSnapshot } from "@/lib/progress/repository";
import type { UserProfile } from "@/lib/auth/profile";
import { isValidUsername, normalizeUsername } from "@/lib/auth/profile";

export async function loginWithUsername(rawUsername: string): Promise<UserProfile> {
  const username = normalizeUsername(rawUsername);

  if (!isValidUsername(username)) {
    throw new Error("Username must be 3–20 characters: letters, numbers, and underscores only.");
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Cloud sync is not configured.");
  }

  const { data: existing, error: selectError } = await supabase
    .from("ptcb_profiles")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);

  if (existing) {
    return { id: existing.id, username: existing.username };
  }

  const { data: created, error: insertError } = await supabase
    .from("ptcb_profiles")
    .insert({ username })
    .select("id, username")
    .single();

  if (insertError) throw new Error(insertError.message);

  return { id: created.id, username: created.username };
}

export async function fetchRemoteProgress(profileId: string): Promise<ProgressSnapshot | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("ptcb_progress")
    .select("answers, missed, sessions, flagged_question_ids")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    answers: data.answers ?? [],
    missed: data.missed ?? [],
    sessions: data.sessions ?? [],
  };
}

export async function fetchRemoteFlaggedIds(profileId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("ptcb_progress")
    .select("flagged_question_ids")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.flagged_question_ids ?? [];
}

export async function saveRemoteProgress(
  profileId: string,
  snapshot: ProgressSnapshot,
  flaggedQuestionIds: string[]
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("ptcb_progress").upsert(
    {
      profile_id: profileId,
      answers: snapshot.answers,
      missed: snapshot.missed,
      sessions: snapshot.sessions,
      flagged_question_ids: flaggedQuestionIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" }
  );

  if (error) throw new Error(error.message);
}

export function mergeSnapshots(
  local: ProgressSnapshot,
  remote: ProgressSnapshot | null
): ProgressSnapshot {
  if (!remote) return local;

  const answerMap = new Map<string, (typeof local.answers)[0]>();
  for (const answer of remote.answers) {
    answerMap.set(answer.questionId, answer);
  }
  for (const answer of local.answers) {
    const existing = answerMap.get(answer.questionId);
    if (!existing || answer.timestamp > existing.timestamp) {
      answerMap.set(answer.questionId, answer);
    }
  }

  const missedMap = new Map<string, (typeof local.missed)[0]>();
  for (const record of remote.missed) {
    missedMap.set(record.questionId, record);
  }
  for (const record of local.missed) {
    const existing = missedMap.get(record.questionId);
    if (!existing || record.lastMissedAt > existing.lastMissedAt) {
      missedMap.set(record.questionId, record);
    } else if (record.consecutiveCorrect > existing.consecutiveCorrect) {
      missedMap.set(record.questionId, record);
    }
  }

  const sessionMap = new Map<string, (typeof local.sessions)[0]>();
  for (const session of remote.sessions) {
    sessionMap.set(session.id, session);
  }
  for (const session of local.sessions) {
    const existing = sessionMap.get(session.id);
    if (!existing || (session.completedAt ?? 0) > (existing.completedAt ?? 0)) {
      sessionMap.set(session.id, session);
    }
  }

  return {
    answers: Array.from(answerMap.values()),
    missed: Array.from(missedMap.values()),
    sessions: Array.from(sessionMap.values()),
  };
}
