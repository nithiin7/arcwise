import Link from "next/link";

export default function NotFound() {
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
      <p
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: "var(--color-surface-offset)",
          lineHeight: 1,
          margin: 0,
        }}
      >
        404
      </p>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
        Page not found
      </h2>
      <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "8px 18px",
          borderRadius: "var(--radius-sm)",
          background: "var(--color-primary)",
          color: "#fff",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        Go home
      </Link>
    </div>
  );
}
