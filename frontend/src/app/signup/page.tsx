"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { post } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/store/authStore";

interface RegisterResponse {
  access_token: string;
  user: AuthUser;
}

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await post<RegisterResponse>("/auth/register", {
        email,
        password,
        name: name || undefined,
      });
      setAuth(data.user, data.access_token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const dividerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "20px 0",
    color: "var(--color-text-faint)",
    fontSize: 12,
  };

  const lineStyle = {
    flex: 1,
    height: 1,
    background: "var(--color-border)",
  };

  return (
    <AuthCard title="Create your account">
      <OAuthButtons label="Sign up" />

      <div style={dividerStyle}>
        <div style={lineStyle} />
        or continue with email
        <div style={lineStyle} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%" }}
        />
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
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%" }}
        />

        {error && (
          <p style={{ fontSize: 13, color: "var(--color-error)" }}>{error}</p>
        )}

        <Button type="submit" disabled={loading} size="md" style={{ width: "100%", marginTop: 4 }}>
          {loading ? "Creating account…" : "Create account"}
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
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
