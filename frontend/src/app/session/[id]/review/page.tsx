"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import { scoreColor } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import BackArrow from "@/components/icons/BackArrow";
import Spinner from "@/components/icons/Spinner";
import { SCORE_KEYS, PRIORITY_COLORS } from "@/constants/review";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const session = useSessionStore((s) => s.session);
  const review = useSessionStore((s) => s.review);
  const setReview = useSessionStore((s) => s.setReview);
  const reset = useSessionStore((s) => s.reset);

  useEffect(() => {
    if (!session) router.replace("/");
  }, [session, router]);

  const reviewMutation = useMutation({
    mutationFn: () => api.reviewDesign(sessionId),
    onSuccess: (r) => setReview(r),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to generate review.");
    },
  });

  useEffect(() => {
    if (!session || review) return;
    reviewMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return null;

  function handleNewDesign() {
    reset();
    router.push("/");
  }

  if (reviewMutation.isPending || !review) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 16,
          background: "var(--color-bg)",
          color: "var(--color-text-muted)",
        }}
      >
        <Spinner size={24} />
        <span style={{ fontSize: 14 }}>Reviewing your design…</span>
      </div>
    );
  }

  const { scores, feedback, strengths, gaps, improvements, reference_architecture_note } = review;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          background: "var(--color-bg)",
          zIndex: 10,
        }}
      >
        <Button
          variant="secondary"
          onClick={() => router.back()}
          style={{ width: 28, height: 28, padding: 0 }}
        >
          <BackArrow />
        </Button>

        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text)",
          }}
        >
          {session.problem}
        </span>

        <Button variant="secondary" onClick={handleNewDesign}>
          New Design
        </Button>
      </header>

      {/* Body */}
      <div style={{ maxWidth: 896, margin: "0 auto", padding: "40px 16px" }}>
        {/* Score grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
            marginBottom: 32,
          }}
        >
          {SCORE_KEYS.map(({ key, label }, i) => {
            const score = scores[key];
            const isOverall = key === "overall";
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                style={{
                  background: isOverall ? "rgba(99,102,241,0.07)" : "var(--color-surface)",
                  border: isOverall
                    ? "1px solid rgba(99,102,241,0.35)"
                    : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span
                    className={scoreColor(score)}
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                    }}
                  >
                    {score}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--color-text-faint)", fontWeight: 400 }}>
                    /10
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
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
        </div>

        {/* Feedback card */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Feedback
          </p>
          <Card style={{ padding: "16px 18px" }}>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-muted)",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {feedback}
            </p>
          </Card>
        </div>

        {/* Strengths & Gaps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {/* Strengths */}
          <Card style={{ padding: "16px 18px" }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#22c55e",
                marginBottom: 10,
              }}
            >
              ✓ Strengths
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {strengths.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "rgba(34,197,94,0.5)", flexShrink: 0, marginTop: 2 }}>
                    •
                  </span>
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Gaps */}
          <Card style={{ padding: "16px 18px" }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#ef4444",
                marginBottom: 10,
              }}
            >
              ✗ Gaps
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {gaps.map((g, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "rgba(239,68,68,0.5)", flexShrink: 0, marginTop: 2 }}>
                    •
                  </span>
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                    {g}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Improvements */}
        {improvements.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-text-faint)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              Improvements
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {improvements.map((imp, i) => {
                const colors = PRIORITY_COLORS[imp.priority] ?? PRIORITY_COLORS.medium;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                  >
                  <Card style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          background: colors.bg,
                          color: colors.text,
                          padding: "2px 8px",
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
                        marginBottom: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      {imp.fix}
                    </p>
                    {imp.components.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {imp.components.map((c, j) => (
                          <span
                            key={j}
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              background: "rgba(99,102,241,0.1)",
                              color: "rgba(99,102,241,0.9)",
                              padding: "2px 8px",
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
            </div>
          </div>
        )}

        {/* Reference note */}
        {reference_architecture_note && (
          <Card style={{ padding: "12px 16px" }}>
            <p
              style={{ fontSize: 12, color: "var(--color-text-faint)", lineHeight: 1.6, margin: 0 }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
                📚 Reference:
              </span>{" "}
              {reference_architecture_note}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
