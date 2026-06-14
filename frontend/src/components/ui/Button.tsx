import type { ButtonHTMLAttributes, CSSProperties } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "sm",
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: "var(--radius-sm)",
    fontFamily: "inherit",
    fontWeight: variant === "primary" ? 600 : 500,
    cursor: disabled ? "not-allowed" : "pointer",
    flexShrink: 0,
    transition: "background 0.15s",
    ...(size === "sm"
      ? { padding: "7px 14px", fontSize: 13 }
      : { padding: "9px 20px", fontSize: 14 }),
    ...(variant === "primary"
      ? {
          border: "none",
          background: disabled ? "var(--color-surface-offset)" : "var(--color-primary)",
          color: disabled ? "var(--color-text-faint)" : "#fff",
        }
      : {
          border: "1px solid var(--color-border)",
          background: "transparent",
          color: disabled ? "var(--color-text-faint)" : "var(--color-text-muted)",
        }),
  };

  return (
    <button {...props} disabled={disabled} style={{ ...base, ...style }}>
      {children}
    </button>
  );
}
