"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Props {
  title?: string;
  message?: string;
  reset?: () => void;
  backHref?: string;
  backLabel?: string;
}

export default function ErrorView({
  title = "Something went wrong",
  message,
  reset,
  backHref = "/",
  backLabel = "Go home",
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
        gap: 12,
        textAlign: "center",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-error)",
          fontSize: 22,
          lineHeight: 1,
        }}
      >
        !
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
        {title}
      </h2>
      {message && (
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            maxWidth: 400,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        {reset && (
          <Button onClick={reset}>Try again</Button>
        )}
        <Link
          href={backHref}
          style={{
            padding: "8px 18px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-surface-offset)",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
