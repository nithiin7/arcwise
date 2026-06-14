import Link from "next/link";
import LogoMark from "@/components/icons/LogoMark";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "24px 16px",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 32,
          textDecoration: "none",
        }}
      >
        <LogoMark />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "var(--color-text)",
          }}
        >
          Arcwise
        </span>
      </Link>

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px 28px",
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: description ? 8 : 24,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
