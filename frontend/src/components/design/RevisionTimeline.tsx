"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Revision } from "@/types";

interface Props {
  revisions: Revision[];
  onRevert: (index: number) => void;
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RevisionTimeline({ revisions, onRevert }: Props) {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div style={{ borderTop: "1px solid var(--color-border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-muted)",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "inherit",
        }}
      >
        <span>Revision History ({revisions.length})</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", color: "var(--color-text-faint)" }}
        >
          <ChevronDown />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "4px 16px 12px" }}>
              {revisions.map((rev, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 0",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--color-primary)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rev.diff_summary}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRevert(i);
                    }}
                    style={{
                      opacity: hoveredIndex === i ? 1 : 0,
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--color-text-faint)",
                      background: "var(--color-surface-offset)",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      padding: "2px 8px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "opacity 0.15s",
                      flexShrink: 0,
                    }}
                  >
                    revert
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
