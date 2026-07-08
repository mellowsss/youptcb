export const PROFILE_STORAGE_KEY = "yousif-ptcb-profile-v1";

export interface UserProfile {
  id: string;
  username: string;
}

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

export function readStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function writeStoredProfile(profile: UserProfile | null): void {
  if (typeof window === "undefined") return;

  if (!profile) {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    return;
  }

  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
