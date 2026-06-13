"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { KeyboardEvent, useRef, useState } from "react";

import type { SessionSummary } from "@/api/sessions";
import { formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<
  SessionSummary["status"],
  { label: string; color: string }
> = {
  complete: { label: "Complete", color: "var(--color-success)" },
  reviewing: { label: "Reviewing", color: "var(--color-primary)" },
  designing: { label: "Designing", color: "#f59e0b" },
  clarifying: { label: "Clarifying", color: "var(--color-text-faint)" },
};

function sessionHref(s: SessionSummary) {
  return s.status === "clarifying" ? `/session/${s.id}/clarify` : `/session/${s.id}/design`;
}

interface SessionCardProps {
  session: SessionSummary;
  onDelete: (id: string) => void;
  onTagsChange: (id: string, tags: string[]) => void;
  deleteDisabled?: boolean;
}

export default function SessionCard({
  session: s,
  onDelete,
  onTagsChange,
  deleteDisabled,
}: SessionCardProps) {
  const [hovered, setHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const status = STATUS_CONFIG[s.status];

  function commitTag() {
    const value = tagInput.trim();
    if (value && !s.tags.includes(value)) {
      onTagsChange(s.id, [...s.tags, value]);
    }
    setTagInput("");
    setAddingTag(false);
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitTag();
    } else if (e.key === "Escape") {
      setTagInput("");
      setAddingTag(false);
    }
  }

  function removeTag(tag: string) {
    onTagsChange(s.id, s.tags.filter((t) => t !== tag));
  }

  const hasTags = s.tags.length > 0;
  const tagsVisible = hasTags || hovered || addingTag;

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        boxShadow: hovered ? "0 0 0 1px var(--color-primary)" : "none",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setDeleteHovered(false);
      }}
    >
      {/* Main clickable area */}
      <Link
        href={sessionHref(s)}
        style={{
          display: "block",
          padding: "14px 40px 12px 16px",
          textDecoration: "none",
        }}
      >
        {/* Problem title — up to 2 lines */}
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text)",
            lineHeight: 1.5,
            marginBottom: 8,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {s.problem}
        </p>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Status dot + label */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: status.color,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: status.color,
                flexShrink: 0,
              }}
            />
            {status.label}
          </span>

          <span
            style={{
              width: 1,
              height: 10,
              background: "var(--color-border)",
              flexShrink: 0,
            }}
          />

          <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
            {formatDate(s.created_at)}
          </span>

          {s.overall_score !== null && (
            <>
              <span
                style={{
                  width: 1,
                  height: 10,
                  background: "var(--color-border)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {s.overall_score}
                <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.55 }}>/10</span>
              </span>
            </>
          )}
        </div>
      </Link>

      {/* Tags row — always rendered, max-height animates to avoid layout jump on hover */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: tagsVisible ? 60 : 0,
          padding: tagsVisible ? "0 40px 10px 16px" : 0,
          transition: "max-height 0.15s ease, padding 0.15s ease",
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          alignItems: "center",
        }}
        onClick={(e) => e.preventDefault()}
      >
          <AnimatePresence initial={false} mode="popLayout">
            {s.tags.map((tag) => (
              <motion.span
                key={tag}
                layout
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 11,
                  color: "var(--color-text-faint)",
                  background: "var(--color-surface-2)",
                  borderRadius: 999,
                  padding: "2px 8px",
                  lineHeight: 1.5,
                }}
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeTag(tag);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 12,
                    height: 12,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: "var(--color-text-faint)",
                    cursor: "pointer",
                    lineHeight: 1,
                    fontSize: 11,
                  }}
                >
                  ×
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {addingTag ? (
            <input
              ref={inputRef}
              autoFocus
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={commitTag}
              placeholder="tag name"
              style={{
                fontSize: 11,
                color: "var(--color-text)",
                background: "transparent",
                border: "1px solid var(--color-primary)",
                borderRadius: 999,
                padding: "2px 8px",
                outline: "none",
                width: 80,
                fontFamily: "inherit",
              }}
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setAddingTag(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              title="Add tag"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 18,
                height: 18,
                padding: 0,
                border: "1px dashed var(--color-border)",
                borderRadius: 999,
                background: "transparent",
                color: "var(--color-text-faint)",
                cursor: "pointer",
                fontSize: 13,
                lineHeight: 1,
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.15s",
              }}
            >
              +
            </button>
          )}
        </div>

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
          top: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
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
