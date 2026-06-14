export function AuthDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "20px 0",
        color: "var(--color-text-faint)",
        fontSize: 12,
      }}
    >
      <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
      or continue with email
      <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
    </div>
  );
}
