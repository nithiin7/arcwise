"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        set({ user, token });
        // Also write to cookie so Next.js middleware can read it
        if (typeof document !== "undefined") {
          document.cookie = `arcwise_token=${token}; path=/; max-age=${24 * 3600}; SameSite=Lax`;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        if (typeof document !== "undefined") {
          document.cookie = "arcwise_token=; path=/; max-age=0; SameSite=Lax";
        }
      },
    }),
    {
      name: "arcwise-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
