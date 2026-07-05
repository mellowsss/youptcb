"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SessionResults } from "@/components/SessionResults";
import { scoreSession } from "@/lib/scoring";
import { getProgressRepository } from "@/lib/progress/local-storage";
import type { SessionRecord } from "@/types/question";

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<SessionRecord | null>(null);

  useEffect(() => {
    const snapshot = getProgressRepository().getSnapshot();
    const found = snapshot.sessions.find((s) => s.id === sessionId) ?? null;
    setSession(found);
  }, [sessionId]);

  if (!session) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">Session not found.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const selectedMap = Object.fromEntries(
    session.answers.map((a) => [a.questionId, a.selectedIndex])
  );
  const score = scoreSession(session.questionIds, session.answers);

  return (
    <SessionResults
      score={score}
      sessionId={session.id}
      mode={session.mode}
      selectedAnswers={selectedMap}
      timeUsedSeconds={session.timeUsedSeconds}
    />
  );
}
