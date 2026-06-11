"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as api from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import type { Session } from "@/types";

const EXAMPLES = [
  "Design WhatsApp",
  "Design Twitter's feed",
  "Design Netflix",
  "Design Uber",
  "Design YouTube",
];

function LogoMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="8" height="8" rx="2" fill="#6366f1" />
      <rect x="10" y="0" width="8" height="8" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="0" y="10" width="8" height="8" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="10" y="10" width="8" height="8" rx="2" fill="#6366f1" opacity="0.4" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit() {
    const trimmed = problem.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      const res = await api.createSession(trimmed);
      const session: Session = {
        id: res.session_id,
        problem: res.problem,
        clarifications: res.questions.map((q) => ({ question: q, answer: "" })),
        architecture: {
          llm_suggested_mermaid: "",
          llm_explanation: "",
          component_justifications: {},
          scale_assumption: "",
          revisions: [],
          final_mermaid: "",
        },
        status: "clarifying",
      };
      setSession(session);
      router.push(`/session/${res.session_id}/clarify`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center min-h-screen px-4 overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
      >
        <div
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center w-full max-w-2xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo + name */}
        <div className="flex items-center gap-2 mb-8">
          <LogoMark />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-muted)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Arcwise
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            textAlign: "center",
            marginBottom: 12,
            background: "linear-gradient(180deg, #f4f4f5 0%, rgba(244,244,245,0.55) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          What will you design today?
        </h1>

        {/* Sub-text */}
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: 15,
            textAlign: "center",
            marginBottom: 32,
            maxWidth: 440,
            lineHeight: 1.6,
          }}
        >
          Enter a system design problem. The AI will guide you through the architecture.
        </p>

        {/* Textarea card */}
        <div
          style={{
            width: "100%",
            position: "relative",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 14px 48px 14px",
          }}
        >
          <textarea
            ref={textareaRef}
            rows={3}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Design a URL shortener like bit.ly…"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              color: "var(--color-text)",
              fontSize: 15,
              lineHeight: 1.6,
              fontFamily: "inherit",
            }}
          />

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!problem.trim() || loading}
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: "var(--radius-sm)",
              background: problem.trim() && !loading ? "var(--color-primary)" : "var(--color-surface-offset)",
              color: problem.trim() && !loading ? "#fff" : "var(--color-text-faint)",
              border: "none",
              cursor: problem.trim() && !loading ? "pointer" : "not-allowed",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
          >
            {loading ? (
              <>
                <Spinner />
                <span>Thinking…</span>
              </>
            ) : (
              <span>Submit ↵</span>
            )}
          </button>
        </div>

        {/* Example pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {EXAMPLES.map((ex, i) => (
            <motion.button
              key={ex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setProblem(ex)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-muted)",
                fontSize: 13,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-primary)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
              }}
            >
              {ex}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
