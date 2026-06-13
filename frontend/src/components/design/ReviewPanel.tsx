"use client";

import { motion } from "framer-motion";
import { scoreColor } from "@/lib/utils";
import type { Review } from "@/types";
import { Card } from "@/components/ui/Card";
import { SCORE_KEYS, PRIORITY_COLORS } from "@/constants/review";

export function ReviewPanel({ review }: { review: Review }) {
  const { scores, feedback, strengths, gaps, improvements, reference_architecture_note } = review;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Score grid */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--color-text-faint)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          Scores
        </p>
        <motion.div
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {SCORE_KEYS.map(({ key, label }) => {
            const score = scores[key];
            const isOverall = key === "overall";
            return (
              <motion.div
                key={key}
                variants={{
                  hidden: { opacity: 0, scale: 0.92 },
                  show: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                }}
                style={{
                  background: isOverall ? "rgba(99,102,241,0.07)" : "var(--color-surface)",
                  border: isOverall
                    ? "1px solid rgba(99,102,241,0.3)"
                    : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  gridColumn: isOverall ? "span 2" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span
                    className={scoreColor(score)}
                    style={{ fontSize: isOverall ? 36 : 24, fontWeight: 700, lineHeight: 1 }}
                  >
                    {score}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--color-text-faint)" }}>/10</span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: isOverall ? "rgba(99,102,241,0.8)" : "var(--color-text-faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    textAlign: "center",
                  }}
                >
                  {label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Feedback */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--color-text-faint)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 6,
          }}
        >
          Feedback
        </p>
        <Card style={{ padding: "12px 14px" }}>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
            {feedback}
          </p>
        </Card>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#22c55e",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            ✓ Strengths
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {strengths.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "rgba(34,197,94,0.5)", flexShrink: 0, fontSize: 13, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#ef4444",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            ✗ Gaps
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {gaps.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "rgba(239,68,68,0.5)", flexShrink: 0, fontSize: 13, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--color-text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Improvements
          </p>
          <motion.div
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
          >
            {improvements.map((imp, i) => {
              const colors = PRIORITY_COLORS[imp.priority] ?? PRIORITY_COLORS.medium;
              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                <Card style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        background: colors.bg,
                        color: colors.text,
                        padding: "2px 6px",
                        borderRadius: 999,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {imp.priority}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text)",
                      marginBottom: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {imp.gap}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginBottom: imp.components.length > 0 ? 8 : 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {imp.fix}
                  </p>
                  {imp.components.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {imp.components.map((c, j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            background: "rgba(99,102,241,0.1)",
                            color: "rgba(99,102,241,0.9)",
                            padding: "2px 7px",
                            borderRadius: 999,
                            border: "1px solid rgba(99,102,241,0.2)",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {reference_architecture_note && (
        <Card style={{ padding: "12px 14px" }}>
          <p style={{ fontSize: 12, color: "var(--color-text-faint)", lineHeight: 1.6, margin: 0 }}>
            <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>📚 Reference:</span>{" "}
            {reference_architecture_note}
          </p>
        </Card>
      )}
    </div>
  );
}
