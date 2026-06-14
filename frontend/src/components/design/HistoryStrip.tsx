"use client";

export function HistoryArrow() {
  return (
    <span
      style={{
        fontSize: 12,
        color: "var(--color-text-faint)",
        padding: "0 4px",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      →
    </span>
  );
}

export function HistoryPill({
  label,
  isViewing,
  onView,
}: {
  label: string;
  isViewing: boolean;
  onView: () => void;
}) {
  return (
    <button
      onClick={onView}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        background: isViewing ? "rgba(99,102,241,0.12)" : "var(--color-bg)",
        border: `1px solid ${isViewing ? "rgba(99,102,241,0.4)" : "var(--color-border)"}`,
        cursor: "pointer",
        fontFamily: "inherit",
        maxWidth: 160,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: isViewing ? "var(--color-primary)" : "var(--color-text-faint)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: isViewing ? 600 : 400,
          color: isViewing ? "var(--color-primary)" : "var(--color-text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </button>
  );
}
