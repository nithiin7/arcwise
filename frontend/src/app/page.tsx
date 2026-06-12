"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import * as api from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import { useSettingsStore } from "@/store/settingsStore";
import type { Session } from "@/types";

const EXAMPLES = [
  "Design WhatsApp",
  "Design Twitter's feed",
  "Design Netflix",
  "Design Uber",
  "Design YouTube",
];

const MODEL_GROUPS = [
  {
    group: "Claude",
    options: [
      { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { value: "claude-opus-4-8", label: "Claude Opus 4.8" },
      { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    ],
  },
  {
    group: "OpenAI",
    options: [
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o mini" },
    ],
  },
  {
    group: "Google",
    options: [
      { value: "gemini/gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { value: "gemini/gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    ],
  },
  {
    group: "xAI",
    options: [{ value: "xai/grok-2", label: "Grok 2" }],
  },
  {
    group: "Groq",
    options: [
      { value: "groq/llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)" },
      { value: "groq/mixtral-8x7b-32768", label: "Mixtral 8x7B (Groq)" },
    ],
  },
];

const DEFAULT_MODEL = "claude-sonnet-4-6";


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

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5 1a.5.5 0 0 1 .491.401l.2 1.196a4.97 4.97 0 0 1 1.055.437l1.02-.614a.5.5 0 0 1 .625.08l.707.707a.5.5 0 0 1 .08.625l-.614 1.02a4.97 4.97 0 0 1 .437 1.055l1.196.2A.5.5 0 0 1 14 7.5v1a.5.5 0 0 1-.403.491l-1.196.2a4.97 4.97 0 0 1-.437 1.055l.614 1.02a.5.5 0 0 1-.08.625l-.707.707a.5.5 0 0 1-.625.08l-1.02-.614a4.97 4.97 0 0 1-1.055.437l-.2 1.196A.5.5 0 0 1 7.5 14h-1a.5.5 0 0 1-.491-.403l-.2-1.196a4.97 4.97 0 0 1-1.055-.437l-1.02.614a.5.5 0 0 1-.625-.08l-.707-.707a.5.5 0 0 1-.08-.625l.614-1.02a4.97 4.97 0 0 1-.437-1.055l-1.196-.2A.5.5 0 0 1 1 7.5v-1a.5.5 0 0 1 .403-.491l1.196-.2a4.97 4.97 0 0 1 .437-1.055l-.614-1.02a.5.5 0 0 1 .08-.625l.707-.707a.5.5 0 0 1 .625-.08l1.02.614a4.97 4.97 0 0 1 1.055-.437l.2-1.196A.5.5 0 0 1 6.5 1h1ZM7 7.5a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Zm.5-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
        fill="currentColor"
      />
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
  const getKeyForModel = useSettingsStore((s) => s.getKeyForModel);
  const [problem, setProblem] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const storedKey = getKeyForModel(model);
  const missingKey = !storedKey;
  const canSubmit = !!problem.trim() && !loading && !missingKey;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.createSession(problem.trim(), model, storedKey || undefined);
      const session: Session = {
        id: res.session_id,
        problem: res.problem,
        model: res.model,
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
      setError(err instanceof Error ? err.message : "Something went wrong.");
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

      {/* Settings link */}
      <Link
        href="/settings"
        style={{
          position: "fixed",
          top: 16,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: "var(--color-text-faint)",
          fontSize: 12,
          textDecoration: "none",
          padding: "5px 10px",
          borderRadius: "var(--radius-sm)",
          transition: "color 0.15s",
          zIndex: 20,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-faint)")}
      >
        <GearIcon />
        Settings
      </Link>

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

          {/* Bottom toolbar */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Model picker */}
            <select
              value={model}
              onChange={(e) => { setModel(e.target.value); setError(""); }}
              style={{
                background: "var(--color-surface-offset)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--color-text-muted)",
                fontSize: 12,
                fontFamily: "inherit",
                padding: "5px 8px",
                cursor: "pointer",
                outline: "none",
                flexShrink: 0,
              }}
            >
              {MODEL_GROUPS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* Missing key hint */}
            {missingKey && (
              <Link
                href="/settings"
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: "var(--color-warning)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                API key required — add in Settings →
              </Link>
            )}

            {/* Spacer when no hint */}
            {!missingKey && <div style={{ flex: 1 }} />}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: "var(--radius-sm)",
                background: canSubmit ? "var(--color-primary)" : "var(--color-surface-offset)",
                color: canSubmit ? "#fff" : "var(--color-text-faint)",
                border: "none",
                cursor: canSubmit ? "pointer" : "not-allowed",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                transition: "background 0.15s",
                flexShrink: 0,
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
        </div>

        {/* Error message */}
        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8, alignSelf: "flex-start" }}>
            {error}
          </p>
        )}

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
