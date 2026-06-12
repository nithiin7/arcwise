"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import type { Revision } from "@/types";
import { ArchitectureCanvas } from "@/components/design/ArchitectureCanvas";
import { ComponentJustifications } from "@/components/design/ComponentJustifications";
import { RevisionTimeline } from "@/components/design/RevisionTimeline";

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3L5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 7L2 2l2.5 5L2 12l10-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function DesignPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const session = useSessionStore((s) => s.session);
  const chatMessages = useSessionStore((s) => s.chatMessages);
  const updateArchitectureMermaid = useSessionStore((s) => s.updateArchitectureMermaid);
  const addChatMessage = useSessionStore((s) => s.addChatMessage);
  const setSession = useSessionStore((s) => s.setSession);

  const [isCanvasLoading, setIsCanvasLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    if (session.architecture.llm_suggested_mermaid) return;

    setIsCanvasLoading(true);
    api
      .suggestArchitecture(sessionId)
      .then((result) => {
        setSession({
          ...session,
          architecture: {
            ...session.architecture,
            llm_suggested_mermaid: result.mermaid_dsl,
            llm_explanation: result.explanation,
            component_justifications: result.component_justifications,
            scale_assumption: result.scale_assumption,
            final_mermaid: result.mermaid_dsl,
          },
          status: "designing",
        });
      })
      .catch(console.error)
      .finally(() => setIsCanvasLoading(false));
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!session) return null;

  const arch = session.architecture;
  const currentMermaid = arch.final_mermaid || arch.llm_suggested_mermaid || "";

  const displayedMermaid =
    previewIndex === null
      ? currentMermaid
      : previewIndex === -1
      ? arch.llm_suggested_mermaid
      : arch.revisions[previewIndex]?.updated_mermaid ?? currentMermaid;

  const previewLabel =
    previewIndex === -1
      ? "Initial design"
      : previewIndex !== null
      ? arch.revisions[previewIndex]?.diff_summary
      : null;

  function handleView(index: number) {
    setPreviewIndex((prev) => (prev === index ? null : index));
  }

  async function handleSend() {
    const msg = inputValue.trim();
    if (!msg || isSending) return;
    setInputValue("");
    setIsSending(true);

    addChatMessage({ role: "user", content: msg, timestamp: new Date() });

    try {
      const result = await api.refineArchitecture(sessionId, msg);

      addChatMessage({
        role: "assistant",
        content: "I've updated the architecture based on your feedback.",
        diff_summary: result.diff_summary,
        timestamp: new Date(),
      });

      updateArchitectureMermaid(result.updated_mermaid);

      const latest = useSessionStore.getState().session;
      if (latest) {
        const newRevision: Revision = {
          user_message: msg,
          updated_mermaid: result.updated_mermaid,
          diff_summary: result.diff_summary,
          timestamp: new Date().toISOString(),
        };
        setSession({
          ...latest,
          architecture: {
            ...latest.architecture,
            revisions: [...latest.architecture.revisions, newRevision],
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  async function handleRevert(index: number) {
    try {
      const result = await api.revertRevision(sessionId, index);
      updateArchitectureMermaid(result.mermaid);
      setPreviewIndex(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit() {
    if (!currentMermaid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.submitArchitecture(sessionId);
      router.push(`/session/${sessionId}/review`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--color-bg)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <BackArrow />
        </button>

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

        <button
          onClick={handleSubmit}
          disabled={!currentMermaid || isSubmitting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: "var(--radius-sm)",
            border: "none",
            background:
              currentMermaid && !isSubmitting
                ? "var(--color-primary)"
                : "var(--color-surface-offset)",
            color:
              currentMermaid && !isSubmitting ? "#fff" : "var(--color-text-faint)",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: currentMermaid && !isSubmitting ? "pointer" : "not-allowed",
            flexShrink: 0,
          }}
        >
          {isSubmitting ? (
            <>
              <Spinner />
              <span>Submitting…</span>
            </>
          ) : (
            <span>Submit for Review →</span>
          )}
        </button>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Diagram area */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {previewIndex !== null && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "5px 10px 5px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--color-text-muted)",
                fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                whiteSpace: "nowrap",
                maxWidth: "calc(100% - 32px)",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                Viewing: <strong style={{ color: "var(--color-text)" }}>{previewLabel}</strong>
              </span>
              <button
                onClick={() => setPreviewIndex(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-faint)",
                  fontSize: 16,
                  lineHeight: 1,
                  padding: "0 2px",
                  flexShrink: 0,
                  fontFamily: "inherit",
                }}
              >
                ×
              </button>
            </div>
          )}
          <ArchitectureCanvas
            mermaid={displayedMermaid}
            isLoading={isCanvasLoading}
            scaleAssumption={arch.scale_assumption}
          />
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 340,
            borderLeft: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Scale callout */}
          {arch.scale_assumption && (
            <div
              style={{
                padding: "8px 16px",
                background: "rgba(245,158,11,0.08)",
                borderBottom: "1px solid rgba(245,158,11,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 14 }}>⚡</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--color-warning)",
                  lineHeight: 1.4,
                }}
              >
                {arch.scale_assumption}
              </span>
            </div>
          )}

          {/* Chat messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 12px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* Initial AI explanation */}
            {arch.llm_explanation && (
              <div
                style={{
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {arch.llm_explanation}
                </p>
              </div>
            )}

            {/* Chat messages */}
            <AnimatePresence initial={false}>
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      background:
                        msg.role === "user"
                          ? "rgba(99,102,241,0.15)"
                          : "var(--color-surface)",
                      borderRadius: "var(--radius-md)",
                      padding: "8px 12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--color-text)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {msg.content}
                    </p>
                    {msg.diff_summary && (
                      <p
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: "var(--color-success)",
                          marginTop: 6,
                          marginBottom: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.diff_summary}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div ref={chatEndRef} />
          </div>

          {/* Component Justifications */}
          {Object.keys(arch.component_justifications).length > 0 && (
            <ComponentJustifications
              justifications={arch.component_justifications}
            />
          )}

          {/* Revision Timeline */}
          {arch.revisions.length > 0 && (
            <RevisionTimeline
              revisions={arch.revisions}
              onRevert={handleRevert}
              onView={handleView}
              viewingIndex={previewIndex}
              initialMermaid={arch.llm_suggested_mermaid}
            />
          )}

          {/* Chat input */}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              padding: "8px 12px",
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask for refinements…"
              disabled={isSending}
              style={{
                flex: 1,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 10px",
                color: "var(--color-text)",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !inputValue.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: "var(--radius-sm)",
                border: "none",
                background:
                  !isSending && inputValue.trim()
                    ? "var(--color-primary)"
                    : "var(--color-surface-offset)",
                color:
                  !isSending && inputValue.trim()
                    ? "#fff"
                    : "var(--color-text-faint)",
                cursor:
                  !isSending && inputValue.trim() ? "pointer" : "not-allowed",
                flexShrink: 0,
              }}
            >
              {isSending ? <Spinner /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
