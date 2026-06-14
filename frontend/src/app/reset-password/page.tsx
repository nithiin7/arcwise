"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { post } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface ResetResponse {
  access_token: string;
  user: AuthUser;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthCard title="Invalid link" description="This password reset link is invalid or has expired.">
        <Link
          href="/forgot-password"
          style={{
            display: "block",
            textAlign: "center",
            fontSize: 13,
            color: "var(--color-primary)",
            textDecoration: "none",
          }}
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await post<ResetResponse>("/auth/reset-password", { token, password });
      setAuth(data.user, data.access_token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Set new password">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          type="password"
          placeholder="New password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%" }}
        />
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={{ width: "100%" }}
        />

        {error && (
          <p style={{ fontSize: 13, color: "var(--color-error)" }}>{error}</p>
        )}

        <Button type="submit" disabled={loading} size="md" style={{ width: "100%", marginTop: 4 }}>
          {loading ? "Saving…" : "Set new password"}
        </Button>
      </form>
    </AuthCard>
  );
}
