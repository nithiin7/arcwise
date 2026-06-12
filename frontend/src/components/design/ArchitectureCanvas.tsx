"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mermaidLib from "mermaid";
import { useSettingsStore } from "@/store/settingsStore";

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface Props {
  mermaid: string;
  isLoading: boolean;
  scaleAssumption?: string;
}

export function ArchitectureCanvas({ mermaid: diagram, isLoading }: Props) {
  const [svg, setSvg] = useState("");
  const [svgKey, setSvgKey] = useState(0);
  const [error, setError] = useState("");
  const renderCountRef = useRef(0);
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);

  useEffect(() => {
    const isDark = resolvedTheme === "dark";
    mermaidLib.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      themeVariables: isDark
        ? {
            background: "#18181b",
            primaryColor: "#6366f1",
            primaryBorderColor: "#4f46e5",
            primaryTextColor: "#f4f4f5",
            lineColor: "#52525b",
            secondaryColor: "#27272a",
          }
        : {
            background: "#ffffff",
            primaryColor: "#6366f1",
            primaryBorderColor: "#4f46e5",
            primaryTextColor: "#18181b",
            lineColor: "#a1a1aa",
            secondaryColor: "#f4f4f5",
          },
    });
  }, [resolvedTheme]);

  useEffect(() => {
    if (!diagram) return;
    setError("");
    const id = `mermaid-render-${++renderCountRef.current}`;
    mermaidLib
      .render(id, diagram)
      .then(({ svg: rendered }) => {
        setSvg(rendered);
        setSvgKey((k) => k + 1);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      });
  }, [diagram, resolvedTheme]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "var(--color-bg)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            `radial-gradient(circle, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          pointerEvents: "none",
        }}
      />

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "var(--color-text-muted)",
            }}
          >
            <Spinner />
            <span style={{ fontSize: 14 }}>Generating architecture…</span>
          </motion.div>
        )}

        {!isLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                maxWidth: 480,
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--color-error)",
                  marginBottom: 4,
                }}
              >
                Render error
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {!isLoading && svg && !error && (
          <motion.div
            key={`svg-${svgKey}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
