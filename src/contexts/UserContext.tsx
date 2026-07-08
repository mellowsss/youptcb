"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isValidUsername,
  normalizeUsername,
  readStoredProfile,
  writeStoredProfile,
  type UserProfile,
} from "@/lib/auth/profile";
import {
  fetchRemoteFlaggedIds,
  fetchRemoteProgress,
  loginWithUsername,
  mergeSnapshots,
  saveRemoteProgress,
} from "@/lib/progress/sync";
import { getProgressRepository } from "@/lib/progress/local-storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  PROGRESS_STORAGE_KEY,
  QUESTION_FLAGS_STORAGE_KEY,
} from "@/lib/progress/types";
import type { ProgressSnapshot } from "@/lib/progress/repository";
import { PROGRESS_CHANGED_EVENT } from "@/lib/progress/local-storage";

interface UserContextValue {
  profile: UserProfile | null;
  ready: boolean;
  syncing: boolean;
  syncError: string | null;
  cloudEnabled: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  syncNow: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

function applySnapshotToLocal(snapshot: ProgressSnapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
}

function applyFlaggedToLocal(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QUESTION_FLAGS_STORAGE_KEY, JSON.stringify(ids));
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const cloudEnabled = isSupabaseConfigured();

  const syncNow = useCallback(async () => {
    if (!profile || !cloudEnabled) return;

    setSyncing(true);
    setSyncError(null);

    try {
      const repo = getProgressRepository();
      const snapshot = repo.getSnapshot();
      const flaggedIds = repo.getFlaggedQuestionIds();
      await saveRemoteProgress(profile.id, snapshot, flaggedIds);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [profile, cloudEnabled]);

  const hydrateFromCloud = useCallback(async (userProfile: UserProfile) => {
    const repo = getProgressRepository();
    const localSnapshot = repo.getSnapshot();
    const remoteSnapshot = await fetchRemoteProgress(userProfile.id);
    const merged = mergeSnapshots(localSnapshot, remoteSnapshot);
    applySnapshotToLocal(merged);

    const remoteFlagged = await fetchRemoteFlaggedIds(userProfile.id);
    const localFlagged = repo.getFlaggedQuestionIds();
    const flaggedSet = new Set([...remoteFlagged, ...localFlagged]);
    applyFlaggedToLocal(Array.from(flaggedSet));

    await saveRemoteProgress(userProfile.id, merged, Array.from(flaggedSet));
  }, []);

  useEffect(() => {
    const stored = readStoredProfile();
    setProfile(stored);
    setReady(true);

    if (stored && cloudEnabled) {
      hydrateFromCloud(stored).catch((error) => {
        setSyncError(error instanceof Error ? error.message : "Could not load cloud data");
      });
    }
  }, [cloudEnabled, hydrateFromCloud]);

  useEffect(() => {
    if (!profile || !cloudEnabled) return;

    const handleChange = () => {
      void syncNow();
    };

    window.addEventListener(PROGRESS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(PROGRESS_CHANGED_EVENT, handleChange);
  }, [profile, cloudEnabled, syncNow]);

  const login = useCallback(
    async (rawUsername: string) => {
      const username = normalizeUsername(rawUsername);
      if (!isValidUsername(username)) {
        throw new Error("Username must be 3–20 characters: letters, numbers, and underscores only.");
      }

      setSyncing(true);
      setSyncError(null);

      try {
        const userProfile = await loginWithUsername(username);
        writeStoredProfile(userProfile);
        setProfile(userProfile);
        await hydrateFromCloud(userProfile);
      } finally {
        setSyncing(false);
      }
    },
    [hydrateFromCloud]
  );

  const logout = useCallback(() => {
    writeStoredProfile(null);
    setProfile(null);
    setSyncError(null);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      ready,
      syncing,
      syncError,
      cloudEnabled,
      login,
      logout,
      syncNow,
    }),
    [profile, ready, syncing, syncError, cloudEnabled, login, logout, syncNow]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
