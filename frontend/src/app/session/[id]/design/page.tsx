"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import * as api from "@/api";
import { chatMessageSchema, type ChatMessageForm } from "@/lib/schemas";
import { useSessionStore } from "@/store/sessionStore";
import { scoreColor } from "@/lib/utils";
import type { Revision } from "@/types";
import { ArchitectureCanvas } from "@/components/design/ArchitectureCanvas";
import { HistoryArrow, HistoryPill } from "@/components/design/HistoryStrip";
import { MermaidEditorModal } from "@/components/design/MermaidEditorModal";
import { ReviewPanel } from "@/components/design/ReviewPanel";
import { ShareModal } from "@/components/design/ShareModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import BackArrow from "@/components/icons/BackArrow";
import SendIcon from "@/components/icons/SendIcon";
import Spinner from "@/components/icons/Spinner";
import ChevronDown from "@/components/icons/ChevronDown";

type Tab = "refine" | "review";

export default function DesignPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const session = useSessionStore((s) => s.session);
  const review = useSessionStore((s) => s.review);
  const chatMessages = useSessionStore((s) => s.chatMessages);
  const updateArchitectureMermaid = useSessionStore((s) => s.updateArchitectureMermaid);
  const addChatMessage = useSessionStore((s) => s.addChatMessage);
  const setSession = useSessionStore((s) => s.setSession);
  const setReview = useSessionStore((s) => s.setReview);
  const reset = useSessionStore((s) => s.reset);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const { review, session: s } = useSessionStore.getState();
    return review || s?.review ? "review" : "refine";
  });
  const [justificationsOpen, setJustificationsOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputFocusRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit: rhfSubmit,
    reset: resetChat,
    formState: { isValid: isChatValid },
  } = useForm<ChatMessageForm>({
    resolver: zodResolver(chatMessageSchema),
    mode: "onChange",
    defaultValues: { message: "" },
  });

  const { ref: msgRefCallback, ...msgRegister } = register("message");

  const mergedInputRef = useCallback(
    (el: HTMLInputElement | null) => {
      inputFocusRef.current = el;
      msgRefCallback(el);
    },
    [msgRefCallback]
  );

  useEffect(() => {
    if (session) {
      if (session.review) {
        setReview(session.review);
      }
      return;
    }
    api.getSession(sessionId).then((s) => {
      setSession(s);
      if (s.review) {
        setReview(s.review);
        setActiveTab("review");
      }
    }).catch(() => router.replace("/"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggestMutation = useMutation({
    mutationFn: () => api.suggestArchitecture(sessionId),
    onSuccess: (result) => {
      setSession({
        ...session!,
        architecture: {
          ...session!.architecture,
          llm_suggested_mermaid: result.mermaid_dsl,
          llm_explanation: result.explanation,
          component_justifications: result.component_justifications,
          scale_assumption: result.scale_assumption,
          final_mermaid: result.mermaid_dsl,
        },
        status: "designing",
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to generate architecture.");
    },
  });

  useEffect(() => {
    if (!session) return;
    if (session.architecture.llm_suggested_mermaid) return;
    suggestMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const refineMutation = useMutation({
    mutationFn: (message: string) => api.refineArchitecture(sessionId, message),
    onSuccess: (result, message) => {
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
          user_message: message,
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
      inputFocusRef.current?.focus();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to refine architecture.");
    },
  });

  const revertMutation = useMutation({
    mutationFn: (index: number) => api.revertRevision(sessionId, index),
    onSuccess: (result) => {
      updateArchitectureMermaid(result.mermaid);
      setPreviewIndex(null);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to revert revision.");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => api.reviewDesign(sessionId),
    onSuccess: (r) => setReview(r),
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to generate review.");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => api.submitArchitecture(sessionId),
    onSuccess: () => {
      setActiveTab("review");
      reviewMutation.mutate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to submit architecture.");
    },
  });

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

  function handleSend(data: ChatMessageForm) {
    addChatMessage({ role: "user", content: data.message, timestamp: new Date() });
    refineMutation.mutate(data.message);
    resetChat();
  }

  const hasReview = review !== null;
  const isReviewing = submitMutation.isPending || reviewMutation.isPending;
  const overallScore = review?.scores?.overall;
  const justificationEntries = Object.entries(arch.component_justifications);
  const showHistoryStrip = arch.revisions.length > 0 || !!arch.llm_suggested_mermaid;

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
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <Button
          variant="secondary"
          onClick={() => { reset(); router.push("/dashboard"); }}
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

        {session.token_usage && session.token_usage.total_tokens > 0 && (
          <div
            title={`${session.token_usage.total_tokens.toLocaleString()} tokens`}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 3,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "4px 10px",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--color-text-faint)", fontWeight: 500, marginRight: 2 }}>
              Cost
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {session.token_usage.cost_usd > 0
                ? `$${session.token_usage.cost_usd < 0.01 ? session.token_usage.cost_usd.toFixed(4) : session.token_usage.cost_usd.toFixed(3)}`
                : `${(session.token_usage.total_tokens / 1000).toFixed(1)}k tok`}
            </span>
          </div>
        )}

        {overallScore !== undefined && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 3,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "4px 12px",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--color-text-faint)", fontWeight: 500, marginRight: 2 }}>
              Score
            </span>
            <span className={scoreColor(overallScore)} style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
              {overallScore}
            </span>
            <span style={{ fontSize: 10, color: "var(--color-text-faint)" }}>/10</span>
          </div>
        )}

        <Button
          variant="secondary"
          onClick={async () => {
            const { share_token } = await api.createShareLink(sessionId);
            setShareUrl(`${window.location.origin}/share/${share_token}`);
          }}
          disabled={!currentMermaid}
        >
          Share
        </Button>

        {hasReview ? (
          <Button
            variant="secondary"
            onClick={() => { setActiveTab("review"); reviewMutation.mutate(); }}
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending ? (
              <>
                <Spinner />
                <span>Regenerating…</span>
              </>
            ) : (
              "Regenerate Score"
            )}
          </Button>
        ) : (
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!currentMermaid || isReviewing}
          >
            {isReviewing ? (
              <>
                <Spinner />
                <span>{submitMutation.isPending ? "Submitting…" : "Reviewing…"}</span>
              </>
            ) : (
              "Submit for Review →"
            )}
          </Button>
        )}
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: diagram area + history strip */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Diagram canvas */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
            {previewIndex !== null ? (
              <>
                {/* Historical revision */}
                <div
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    borderRight: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 12px",
                      borderBottom: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      flexShrink: 0,
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {previewLabel}
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
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <ArchitectureCanvas
                      mermaid={displayedMermaid}
                      isLoading={false}
                      scaleAssumption={arch.scale_assumption}
                    />
                  </div>
                </div>
                {/* Current state */}
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      borderBottom: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Current</span>
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <ArchitectureCanvas
                      mermaid={currentMermaid}
                      isLoading={suggestMutation.isPending}
                      scaleAssumption={arch.scale_assumption}
                      onEditCode={() => setCodeEditorOpen(true)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <ArchitectureCanvas
                mermaid={currentMermaid}
                isLoading={suggestMutation.isPending}
                scaleAssumption={arch.scale_assumption}
                onEditCode={() => setCodeEditorOpen(true)}
              />
            )}
          </div>

          {/* History strip */}
          {showHistoryStrip && (
            <div
              style={{
                height: 44,
                borderTop: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                display: "flex",
                alignItems: "center",
                gap: 0,
                padding: "0 12px",
                overflowX: "auto",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--color-text-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginRight: 10,
                  flexShrink: 0,
                }}
              >
                History
              </span>

              {arch.llm_suggested_mermaid && (
                <>
                  <HistoryPill
                    label="Initial"
                    isViewing={previewIndex === -1}
                    canRevert={false}
                    onView={() => handleView(-1)}
                    onRevert={() => {}}
                  />
                  {arch.revisions.length > 0 && <HistoryArrow />}
                </>
              )}

              {arch.revisions.map((rev, i) => (
                <span key={i} style={{ display: "contents" }}>
                  <HistoryPill
                    label={rev.diff_summary}
                    isViewing={previewIndex === i}
                    canRevert={true}
                    onView={() => handleView(i)}
                    onRevert={() => revertMutation.mutate(i)}
                  />
                  {i < arch.revisions.length - 1 && <HistoryArrow />}
                </span>
              ))}

              {/* Current marker */}
              {(arch.llm_suggested_mermaid || arch.revisions.length > 0) && (
                <>
                  <HistoryArrow />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-primary)" }}>
                      Current
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 400,
            borderLeft: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Tab bar — only when review exists or is generating */}
          {(hasReview || isReviewing) && (
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid var(--color-border)",
                flexShrink: 0,
              }}
            >
              {(["refine", "review"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    border: "none",
                    borderBottom: activeTab === tab
                      ? "2px solid var(--color-primary)"
                      : "2px solid transparent",
                    background: "transparent",
                    color: activeTab === tab ? "var(--color-text)" : "var(--color-text-faint)",
                    cursor: "pointer",
                    transition: "color 0.15s",
                  }}
                >
                  {tab === "refine" ? "Refine" : "Review"}
                </button>
              ))}
            </div>
          )}

          {/* Tab content with slide animation */}
          <AnimatePresence mode="wait" initial={false}>
          {/* Refine tab */}
          {activeTab === "refine" && (
            <motion.div
              key="refine"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              {/* Scale assumption */}
              {arch.scale_assumption && (
                <div
                  style={{
                    padding: "8px 16px",
                    background: "rgba(245,158,11,0.08)",
                    borderBottom: "1px solid rgba(245,158,11,0.2)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚡</span>
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

              {/* AI explanation + component justifications */}
              {arch.llm_explanation && (
                <div
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ padding: "12px 16px 10px" }}>
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

                  {justificationEntries.length > 0 && (
                    <>
                      <button
                        onClick={() => setJustificationsOpen((o) => !o)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "4px 16px 10px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--color-text-faint)",
                          }}
                        >
                          Component reasoning ({justificationEntries.length})
                        </span>
                        <motion.span
                          animate={{ rotate: justificationsOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: "flex", color: "var(--color-text-faint)" }}
                        >
                          <ChevronDown />
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {justificationsOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div
                              style={{
                                padding: "0 12px 12px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                maxHeight: 240,
                                overflowY: "auto",
                              }}
                            >
                              {justificationEntries.map(([name, reason]) => (
                                <div
                                  key={name}
                                  style={{
                                    padding: "9px 12px",
                                    background: "var(--color-surface)",
                                    borderRadius: "var(--radius-md)",
                                    borderLeft: "3px solid rgba(99,102,241,0.5)",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "inline-block",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "rgba(99,102,241,0.9)",
                                      background: "rgba(99,102,241,0.1)",
                                      border: "1px solid rgba(99,102,241,0.2)",
                                      borderRadius: 4,
                                      padding: "1px 7px",
                                      marginBottom: 5,
                                      letterSpacing: "0.01em",
                                    }}
                                  >
                                    {name}
                                  </span>
                                  <p
                                    style={{
                                      fontSize: 12,
                                      color: "var(--color-text-muted)",
                                      lineHeight: 1.55,
                                      margin: 0,
                                    }}
                                  >
                                    {reason as string}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
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
                {chatMessages.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "var(--color-text-faint)",
                      fontSize: 13,
                      textAlign: "center",
                      padding: "0 16px",
                    }}
                  >
                    Ask me to refine the architecture…
                  </div>
                )}

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
                <Input
                  ref={mergedInputRef}
                  {...msgRegister}
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      rhfSubmit(handleSend)();
                    }
                  }}
                  placeholder="Ask for refinements…"
                  disabled={refineMutation.isPending}
                  style={{ flex: 1, padding: "8px 10px" }}
                />
                <Button
                  onClick={rhfSubmit(handleSend)}
                  disabled={refineMutation.isPending || !isChatValid}
                  style={{ width: 34, height: 34, padding: 0 }}
                >
                  {refineMutation.isPending ? <Spinner /> : <SendIcon />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Review tab */}
          {activeTab === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, overflowY: "auto", padding: "16px" }}
            >
              {isReviewing && !review ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 12,
                    color: "var(--color-text-muted)",
                  }}
                >
                  <Spinner size={20} />
                  <span style={{ fontSize: 13 }}>Reviewing your design…</span>
                </div>
              ) : review ? (
                <>
                  {reviewMutation.isPending && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 14,
                        padding: "8px 12px",
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <Spinner size={14} />
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                        Regenerating score…
                      </span>
                    </div>
                  )}
                  <ReviewPanel review={review} />
                </>
              ) : null}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {shareUrl && (
          <ShareModal shareUrl={shareUrl} onClose={() => setShareUrl(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {codeEditorOpen && (
          <MermaidEditorModal
            initialMermaid={currentMermaid}
            onApply={async (mermaid) => {
              await api.updateMermaid(sessionId, mermaid);
              updateArchitectureMermaid(mermaid);
            }}
            onClose={() => setCodeEditorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

