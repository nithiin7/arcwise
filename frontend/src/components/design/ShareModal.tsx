"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface ShareModalProps {
  shareUrl: string;
  onClose: () => void;
}

export function ShareModal({ shareUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 6 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: 24,
          width: 480,
          maxWidth: "calc(100vw - 32px)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>
            Share design
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-faint)",
              fontSize: 20,
              lineHeight: 1,
              padding: "0 2px",
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
          Anyone with this link can view the problem, architecture diagram, and review scores — read-only.
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: 13,
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-muted)",
              fontFamily: "monospace",
              outline: "none",
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              background: copied ? "rgba(34,197,94,0.15)" : "var(--color-primary)",
              color: copied ? "#22c55e" : "#fff",
              flexShrink: 0,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
