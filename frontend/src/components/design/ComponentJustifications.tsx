"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChevronDown from "@/components/icons/ChevronDown";
import type { ComponentJustificationsProps } from "@/types";

export function ComponentJustifications({ justifications }: ComponentJustificationsProps) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(justifications);

  if (entries.length === 0) return null;

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
        <span>Component Justifications</span>
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
            <div
              style={{
                maxHeight: 192,
                overflowY: "auto",
                padding: "4px 16px 12px",
              }}
            >
              {entries.map(([name, reason]) => (
                <div key={name} style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-primary)",
                      marginBottom: 2,
                    }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
