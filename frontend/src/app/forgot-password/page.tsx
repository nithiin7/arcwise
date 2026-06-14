"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { post } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthCard
        title="Check your email"
        description={`If ${email} is registered, we've sent a password reset link. Check your inbox (and spam folder).`}
      >
        <Link
          href="/login"
          style={{
            display: "block",
            textAlign: "center",
            fontSize: 13,
            color: "var(--color-primary)",
            textDecoration: "none",
          }}
        >
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email and we'll send you a link to reset your password."
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%" }}
        />

        {error && (
          <p style={{ fontSize: 13, color: "var(--color-error)" }}>{error}</p>
        )}

        <Button type="submit" disabled={loading} size="md" style={{ width: "100%", marginTop: 4 }}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p
        style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 13,
          color: "var(--color-text-muted)",
        }}
      >
        <Link href="/login" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
