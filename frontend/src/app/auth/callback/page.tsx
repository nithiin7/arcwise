"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { get } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/types";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login?error=oauth_failed");
      return;
    }

    // Set token first so the API call is authenticated
    // We need to fetch the user info
    localStorage.setItem(
      "arcwise-auth",
      JSON.stringify({ state: { token, user: null }, version: 0 })
    );
    document.cookie = `arcwise_token=${token}; path=/; max-age=${24 * 3600}; SameSite=Lax`;

    get<AuthUser>("/auth/me")
      .then((user) => {
        setAuth(user, token);
        router.replace("/dashboard");
      })
      .catch(() => {
        router.replace("/login?error=oauth_failed");
      });
  }, [searchParams, setAuth, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        color: "var(--color-text-muted)",
        fontSize: 14,
      }}
    >
      Signing you in…
    </div>
  );
}
