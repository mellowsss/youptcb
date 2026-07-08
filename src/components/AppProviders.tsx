"use client";

import { UserProvider } from "@/contexts/UserContext";
import { UsernameLogin } from "@/components/UsernameLogin";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
      <UsernameLogin />
    </UserProvider>
  );
}
