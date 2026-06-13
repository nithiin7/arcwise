"use client";

import Link from "next/link";
import { useState } from "react";

import type { SessionSummary } from "@/api/sessions";
import { formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<
  SessionSummary["status"],
  { label: string; color: string; bg: string; border: string }
> = {
  complete: {
    label: "Complete",
    color: "var(--color-success)",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.2)",
  },
  reviewing: {
    label: "Reviewing",
    color: "var(--color-primary)",
    bg: "rgba(99, 102, 241, 0.1)",
    border: "rgba(99, 102, 241, 0.2)",
  },
  designing: {
    label: "Designing",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.2)",
  },
  clarifying: {
    label: "Clarifying",
    color: "var(--color-text-faint)",
    bg: "rgba(161, 161, 170, 0.1)",
    border: "rgba(161, 161, 170, 0.2)",
  },
};

function sessionHref(s: SessionSummary) {
  return s.status === "clarifying" ? `/session/${s.id}/clarify` : `/session/${s.id}/design`;
}

interface SessionCardProps {
  session: SessionSummary;
  onDelete: (id: string) => void;
  deleteDisabled?: boolean;
}

export default function SessionCard({ session: s, onDelete, deleteDisabled }: SessionCardProps) {
  const [hovered, setHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const status = STATUS_CONFIG[s.status];

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setDeleteHovered(false); }}
    >
      <Link
        href={sessionHref(s)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "12px 48px 12px 16px",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${hovered ? "var(--color-primary)" : "var(--color-border)"}`,
          background: hovered ? "var(--color-surface-2)" : "var(--color-surface)",
          textDecoration: "none",
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        {/* Problem */}
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.4,
          }}
        >
          {s.problem}
        </span>

        {/* Meta row: status left, date + score right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Status pill */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: status.color,
              background: status.bg,
              border: `1px solid ${status.border}`,
              borderRadius: 999,
              padding: "2px 7px",
              lineHeight: 1.6,
              flexShrink: 0,
            }}
          >
            {status.label}
          </span>

          {/* Right side: score + date (date always anchored at far right) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {s.overall_score !== null && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {s.overall_score}
                <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.6 }}>/10</span>
              </span>
            )}
            <span style={{ fontSize: 11, color: "var(--color-text-faint)" }}>
              {formatDate(s.created_at)}
            </span>
          </div>
        </div>
      </Link>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(s.id);
        }}
        disabled={deleteDisabled}
        title="Delete"
        onMouseEnter={() => setDeleteHovered(true)}
        onMouseLeave={() => setDeleteHovered(false)}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "var(--radius-sm)",
          border: "none",
          background: deleteHovered ? "rgba(239,68,68,0.08)" : "transparent",
          color: deleteHovered ? "var(--color-error)" : "var(--color-text-faint)",
          cursor: "pointer",
          padding: 0,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
          transition: "opacity 0.15s, color 0.15s, background 0.15s",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  );
}
