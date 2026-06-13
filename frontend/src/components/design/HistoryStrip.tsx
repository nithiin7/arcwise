"use client";

import { useState } from "react";

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
  canRevert,
  onView,
  onRevert,
}: {
  label: string;
  isViewing: boolean;
  canRevert: boolean;
  onView: () => void;
  onRevert: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onView}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: canRevert && hovered ? "999px 0 0 999px" : 999,
          background: isViewing ? "rgba(99,102,241,0.12)" : "var(--color-bg)",
          border: `1px solid ${isViewing ? "rgba(99,102,241,0.4)" : "var(--color-border)"}`,
          borderRight: canRevert && hovered ? "none" : undefined,
          cursor: "pointer",
          fontFamily: "inherit",
          maxWidth: 160,
          transition: "background 0.1s, border-color 0.1s",
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: isViewing ? "var(--color-primary)" : "var(--color-text-faint)",
            flexShrink: 0,
            transition: "background 0.1s",
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
            transition: "color 0.1s",
          }}
        >
          {label}
        </span>
      </button>

      {canRevert && hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRevert();
          }}
          title="Revert to this version"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "3px 8px",
            borderRadius: "0 999px 999px 0",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderLeft: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 11,
            color: "var(--color-text-faint)",
          }}
        >
          ↩
        </button>
      )}
    </div>
  );
}
