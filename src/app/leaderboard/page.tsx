"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Award, Target, CheckCircle, TrendingUp } from "lucide-react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface LeaderboardEntry {
  id: string;
  username: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  sessionsCompleted: number;
  currentStreak: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"totalQuestions" | "accuracy" | "correctAnswers">("totalQuestions");

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("ptcb_profiles")
          .select(`
            id,
            username,
            ptcb_progress (
              answers,
              sessions
            )
          `);

        if (error) throw error;

        const entries: LeaderboardEntry[] = (data || []).map((profile: any) => {
          const progress = profile.ptcb_progress;
          const answers = progress?.answers || [];
          const sessions = progress?.sessions || [];
          
          const totalQuestions = answers.length;
          const correctAnswers = answers.filter((a: any) => a.correct).length;
          const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
          const sessionsCompleted = sessions.length;
          
          // Calculate current streak (consecutive correct answers from most recent)
          let currentStreak = 0;
          const sortedAnswers = [...answers].sort((a: any, b: any) => b.timestamp - a.timestamp);
          for (const answer of sortedAnswers) {
            if (answer.correct) {
              currentStreak++;
            } else {
              break;
            }
          }

          return {
            id: profile.id,
            username: profile.username,
            totalQuestions,
            correctAnswers,
            accuracy,
            sessionsCompleted,
            currentStreak,
          };
        });

        // Filter out users with no activity
        const activeEntries = entries.filter(e => e.totalQuestions > 0);
        setLeaderboard(activeEntries);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === "accuracy") {
      // For accuracy, require minimum questions for fair comparison
      const aScore = a.totalQuestions >= 10 ? a.accuracy : -1;
      const bScore = b.totalQuestions >= 10 ? b.accuracy : -1;
      return bScore - aScore;
    }
    return b[sortBy] - a[sortBy];
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="flex h-6 w-6 items-center justify-center text-sm font-bold text-forest/50">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
      default:
        return "bg-white border-stone";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sage border-t-transparent" />
          <p className="mt-4 text-sm text-forest/60">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="mt-2 text-sm text-forest/60">
          See how you stack up against other PTCB exam preppers
        </p>
      </div>

      {/* Sort options */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSortBy("totalQuestions")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            sortBy === "totalQuestions"
              ? "bg-forest text-white"
              : "bg-clay-light text-forest hover:bg-stone"
          }`}
        >
          <Target className="mr-2 inline-block h-4 w-4" />
          Most Questions
        </button>
        <button
          onClick={() => setSortBy("correctAnswers")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            sortBy === "correctAnswers"
              ? "bg-forest text-white"
              : "bg-clay-light text-forest hover:bg-stone"
          }`}
        >
          <CheckCircle className="mr-2 inline-block h-4 w-4" />
          Most Correct
        </button>
        <button
          onClick={() => setSortBy("accuracy")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            sortBy === "accuracy"
              ? "bg-forest text-white"
              : "bg-clay-light text-forest hover:bg-stone"
          }`}
        >
          <TrendingUp className="mr-2 inline-block h-4 w-4" />
          Best Accuracy
        </button>
      </div>

      {sortedLeaderboard.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone bg-white p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-stone" />
          <p className="mt-4 font-serif text-lg text-forest">No rankings yet</p>
          <p className="mt-2 text-sm text-forest/60">
            Be the first to complete some practice questions!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLeaderboard.map((entry, index) => {
            const rank = index + 1;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-4 rounded-2xl border p-4 shadow-soft transition hover:shadow-md ${getRankBg(rank)}`}
              >
                <div className="flex h-12 w-12 items-center justify-center">
                  {getRankIcon(rank)}
                </div>
                
                <div className="flex-1">
                  <p className="font-serif text-lg font-semibold text-forest">
                    {entry.username}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest/60">
                    <span>{entry.sessionsCompleted} sessions</span>
                    {entry.currentStreak > 0 && (
                      <span className="text-sage">🔥 {entry.currentStreak} streak</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-forest">{entry.totalQuestions}</p>
                    <p className="text-xs text-forest/50">Questions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-sage">{entry.correctAnswers}</p>
                    <p className="text-xs text-forest/50">Correct</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${entry.accuracy >= 70 ? "text-sage" : entry.accuracy >= 50 ? "text-yellow-600" : "text-terracotta"}`}>
                      {entry.accuracy}%
                    </p>
                    <p className="text-xs text-forest/50">Accuracy</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats summary */}
      {sortedLeaderboard.length > 0 && (
        <div className="rounded-3xl border border-stone bg-clay-light/50 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest">Community Stats</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-3xl font-bold text-forest">
                {sortedLeaderboard.reduce((sum, e) => sum + e.totalQuestions, 0).toLocaleString()}
              </p>
              <p className="text-sm text-forest/60">Total Questions Answered</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-sage">
                {sortedLeaderboard.reduce((sum, e) => sum + e.correctAnswers, 0).toLocaleString()}
              </p>
              <p className="text-sm text-forest/60">Total Correct</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-forest">
                {sortedLeaderboard.length}
              </p>
              <p className="text-sm text-forest/60">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-forest">
                {Math.round(sortedLeaderboard.reduce((sum, e) => sum + e.accuracy, 0) / sortedLeaderboard.length)}%
              </p>
              <p className="text-sm text-forest/60">Avg Accuracy</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
