"use client";

import { useState } from "react";
import { Cloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useUser } from "@/contexts/UserContext";
import { isValidUsername, normalizeUsername } from "@/lib/auth/profile";

export function UsernameLogin() {
  const { profile, ready, syncing, syncError, cloudEnabled, login } = useUser();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ready || profile || !cloudEnabled) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeUsername(username);

    if (!isValidUsername(normalized)) {
      setError("Use 3–20 characters: letters, numbers, and underscores only.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-forest/30 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-clay-light text-sage">
          <Cloud strokeWidth={1.5} className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-forest">
          Save progress <em>everywhere</em>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-forest/70">
          Enter a username to sync your scores, missed questions, and exam history across any
          device. No password needed — just remember your username.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-forest">
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. yousif"
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              className="mt-2 w-full rounded-full border-b-2 border-stone bg-clay-light/40 px-4 py-3 text-forest placeholder:text-forest/40 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            />
          </label>

          {(error || syncError) && (
            <p className="text-sm text-terracotta">{error || syncError}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting || syncing}
          >
            {submitting || syncing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <p className="mt-4 text-xs text-forest/45">
          Same username on phone or computer brings back your progress. Anyone who knows your
          username can access your data — pick something unique to you.
        </p>
      </Card>
    </div>
  );
}
