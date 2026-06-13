"use client";

import Link from "next/link";
import { useState } from "react";

import type { SessionSummary } from "@/api/sessions";

function statusLabel(status: SessionSummary["status"]) {
  switch (status) {
    case "complete":
      return "Complete";
    case "reviewing":
      return "Reviewing";
    case "designing":
      return "Designing";
    default:
      return "Clarifying";
  }
}

function statusColor(status: SessionSummary["status"]) {
  switch (status) {
    case "complete":
      return "var(--color-success, #22c55e)";
    case "reviewing":
      return "var(--color-primary)";
    case "designing":
      return "#f59e0b";
    default:
      return "var(--color-text-faint)";
  }
}

function sessionHref(s: SessionSummary) {
  switch (s.status) {
    case "complete":
    case "reviewing":
    case "designing":
      return `/session/${s.id}/design`;
    default:
      return `/session/${s.id}/clarify`;
  }
}

interface SessionCardProps {
  session: SessionSummary;
  onDelete: (id: string) => void;
  deleteDisabled?: boolean;
}

export default function SessionCard({ session: s, onDelete, deleteDisabled }: SessionCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={sessionHref(s)}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          paddingRight: 40,
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          textDecoration: "none",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-primary)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-border)")
        }
      >
        {/* Status dot */}
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: statusColor(s.status),
            flexShrink: 0,
          }}
        />

        {/* Problem */}
        <span
          style={{
            flex: 1,
            fontSize: 13,
            color: "var(--color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {s.problem}
        </span>

        {/* Score badge */}
        {s.overall_score !== null && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--color-primary)",
              flexShrink: 0,
            }}
          >
            {s.overall_score}/10
          </span>
        )}

        {/* Status label */}
        <span
          style={{
            fontSize: 11,
            color: statusColor(s.status),
            flexShrink: 0,
            minWidth: 60,
            textAlign: "right",
          }}
        >
          {statusLabel(s.status)}
        </span>

        {/* Date */}
        <span style={{ fontSize: 11, color: "var(--color-text-faint)", flexShrink: 0 }}>
          {new Date(s.created_at).toLocaleDateString()}
        </span>
      </Link>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(s.id);
        }}
        disabled={deleteDisabled}
        title="Delete"
        style={{
          position: "absolute",
          right: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "var(--radius-sm)",
          border: "none",
          background: "transparent",
          color: "var(--color-text-faint)",
          cursor: "pointer",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s, color 0.15s",
          padding: 0,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#ef4444")}
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-faint)")
        }
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
