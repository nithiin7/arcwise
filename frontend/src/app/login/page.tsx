"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { post } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) router.replace(searchParams.get("next") ?? "/dashboard");
  }, [token, router, searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const oauthError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await post<AuthResponse>("/auth/login", { email, password });
      setAuth(data.user, data.access_token);
      const next = searchParams.get("next") ?? "/dashboard";
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Sign in to Arcwise">
      <OAuthButtons label="Sign in" />

      <AuthDivider />

      {oauthError && (
        <p style={{ fontSize: 13, color: "var(--color-error)", marginBottom: 14 }}>
          {oauthError === "no_email"
            ? "Could not retrieve your email from the OAuth provider."
            : "OAuth sign-in failed. Please try again."}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%" }}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%" }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link
            href="/forgot-password"
            style={{ fontSize: 12, color: "var(--color-primary)", textDecoration: "none" }}
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--color-error)" }}>{error}</p>
        )}

        <Button type="submit" disabled={loading} size="md" style={{ width: "100%", marginTop: 4 }}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p
        style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 13,
          color: "var(--color-text-muted)",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
