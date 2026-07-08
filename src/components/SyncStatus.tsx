"use client";

import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

export function SyncStatus() {
  const { profile, syncing, syncError, syncNow, cloudEnabled } = useUser();

  if (!cloudEnabled) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {profile ? (
        <>
          <span className="rounded-full bg-clay-light px-3 py-1 font-medium uppercase tracking-widest text-forest/70">
            @{profile.username}
          </span>
          {syncing && (
            <span className="inline-flex items-center gap-1 text-sage">
              <Loader2 className="h-3 w-3 animate-spin" />
              Syncing
            </span>
          )}
          {syncError && (
            <button
              type="button"
              onClick={() => syncNow()}
              className="text-terracotta underline-offset-2 hover:underline"
            >
              Sync failed — retry
            </button>
          )}
        </>
      ) : (
        <span className="text-forest/50">Not signed in</span>
      )}
    </div>
  );
}
