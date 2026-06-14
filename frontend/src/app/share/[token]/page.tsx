"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import mermaidLib from "mermaid";

import { getSharedSession } from "@/api/sessions";
import { scoreColor } from "@/lib/utils";
import { PRIORITY_COLORS, SCORE_KEYS } from "@/constants/review";
import type { Session } from "@/types";

function MermaidStatic({ diagram }: { diagram: string }) {
  const [svg, setSvg] = useState("");
  const idRef = useRef(0);

  useEffect(() => {
    mermaidLib.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        background: "#18181b",
        primaryColor: "#6366f1",
        primaryBorderColor: "#4f46e5",
        primaryTextColor: "#f4f4f5",
        lineColor: "#52525b",
        secondaryColor: "#27272a",
      },
    });
    const id = `mermaid-share-${++idRef.current}`;
    mermaidLib
      .render(id, diagram)
      .then(({ svg: rendered }) => setSvg(rendered))
      .catch(() => setSvg(""));
  }, [diagram]);

  if (!svg) return null;
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSharedSession(token)
      .then(setSession)
      .catch(() => setError(true));
  }, [token]);

  async function handleDownloadPdf() {
    if (!contentRef.current || !session) return;
    setIsPdfLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const slug = session.problem.slice(0, 40).replace(/\s+/g, "-").toLowerCase();
      html2pdf()
        .set({
          margin: 0.5,
          filename: `arcwise-${slug}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(contentRef.current)
        .save();
    } finally {
      setIsPdfLoading(false);
    }
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          fontSize: 14,
        }}
      >
        Session not found or link has expired.
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-faint)",
          fontSize: 13,
        }}
      >
        Loading…
      </div>
    );
  }

  const arch = session.architecture;
  const mermaid = arch.final_mermaid || arch.llm_suggested_mermaid;
  const review = session.review;
  const overallScore = review?.scores?.overall;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", padding: "0 0 48px" }}>
      {/* Top bar */}
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary)", letterSpacing: "-0.01em" }}>
          Arcwise
        </span>
        <button
          onClick={handleDownloadPdf}
          disabled={isPdfLoading}
          style={{
            padding: "7px 14px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            background: "transparent",
            color: isPdfLoading ? "var(--color-text-faint)" : "var(--color-text-muted)",
            cursor: isPdfLoading ? "not-allowed" : "pointer",
          }}
        >
          {isPdfLoading ? "Generating PDF…" : "Download PDF"}
        </button>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Problem */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Problem
          </p>
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text)", lineHeight: 1.5, margin: 0 }}>
              {session.problem}
            </p>
            {overallScore !== undefined && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                  background: "rgba(99,102,241,0.07)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 16px",
                }}
              >
                <span className={scoreColor(overallScore)} style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                  {overallScore}
                </span>
                <span style={{ fontSize: 10, color: "var(--color-text-faint)" }}>/10</span>
              </div>
            )}
          </div>
        </div>

        {/* Clarifications */}
        {session.clarifications.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Clarifications
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {session.clarifications.map((qa, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 16px",
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>
                    {qa.question}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--color-text)", margin: 0 }}>
                    {qa.answer || <span style={{ color: "var(--color-text-faint)" }}>No answer provided</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Architecture */}
        {mermaid && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Architecture
            </p>
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              <MermaidStatic diagram={mermaid} />
            </div>
            {arch.llm_explanation && (
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, marginTop: 12 }}>
                {arch.llm_explanation}
              </p>
            )}
          </div>
        )}

        {/* Review */}
        {review && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Review
            </p>

            {/* Score grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginBottom: 16 }}>
              {SCORE_KEYS.map(({ key, label }) => {
                const score = review.scores[key];
                const isOverall = key === "overall";
                return (
                  <div
                    key={key}
                    style={{
                      background: isOverall ? "rgba(99,102,241,0.07)" : "var(--color-surface)",
                      border: isOverall ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--color-border)",
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
                      <span className={scoreColor(score)} style={{ fontSize: isOverall ? 36 : 24, fontWeight: 700, lineHeight: 1 }}>
                        {score}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--color-text-faint)" }}>/10</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: isOverall ? "rgba(99,102,241,0.8)" : "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Feedback */}
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
                {review.feedback}
              </p>
            </div>

            {/* Strengths */}
            {review.strengths.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Strengths
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {review.strengths.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "rgba(34,197,94,0.5)", flexShrink: 0, fontSize: 13, marginTop: 1 }}>•</span>
                      <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps */}
            {review.gaps.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Gaps
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {review.gaps.map((g, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "rgba(239,68,68,0.5)", flexShrink: 0, fontSize: 13, marginTop: 1 }}>•</span>
                      <span style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {review.improvements.length > 0 && (
              <div style={{ marginBottom: review.reference_architecture_note ? 16 : 0 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Improvements
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {review.improvements.map((imp, i) => {
                    const colors = PRIORITY_COLORS[imp.priority] ?? PRIORITY_COLORS.medium;
                    return (
                      <div
                        key={i}
                        style={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          padding: "12px 14px",
                        }}
                      >
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
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", marginBottom: 4, lineHeight: 1.4 }}>
                          {imp.gap}
                        </p>
                        <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: imp.components.length > 0 ? 8 : 0, lineHeight: 1.5 }}>
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
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {review.reference_architecture_note && (
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 14px",
                }}
              >
                <p style={{ fontSize: 12, color: "var(--color-text-faint)", lineHeight: 1.6, margin: 0 }}>
                  <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>Reference:</span>{" "}
                  {review.reference_architecture_note}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p style={{ fontSize: 12, color: "var(--color-text-faint)", textAlign: "center", marginTop: 8 }}>
          Generated with Arcwise — AI system design platform
        </p>
      </div>
    </div>
  );
}
