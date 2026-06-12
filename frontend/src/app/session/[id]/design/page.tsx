"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import * as api from "@/lib/api";
import { chatMessageSchema, type ChatMessageForm } from "@/lib/schemas";
import { useSessionStore } from "@/store/sessionStore";
import type { Revision } from "@/types";
import { ArchitectureCanvas } from "@/components/design/ArchitectureCanvas";
import { ComponentJustifications } from "@/components/design/ComponentJustifications";
import { RevisionTimeline } from "@/components/design/RevisionTimeline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import BackArrow from "@/components/icons/BackArrow";
import SendIcon from "@/components/icons/SendIcon";
import Spinner from "@/components/icons/Spinner";

export default function DesignPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const session = useSessionStore((s) => s.session);
  const chatMessages = useSessionStore((s) => s.chatMessages);
  const updateArchitectureMermaid = useSessionStore((s) => s.updateArchitectureMermaid);
  const addChatMessage = useSessionStore((s) => s.addChatMessage);
  const setSession = useSessionStore((s) => s.setSession);

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

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
    if (!session) router.replace("/");
  }, [session, router]);

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

  const submitMutation = useMutation({
    mutationFn: () => api.submitArchitecture(sessionId),
    onSuccess: () => {
      router.push(`/session/${sessionId}/review`);
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

        <Button onClick={() => submitMutation.mutate()} disabled={!currentMermaid || submitMutation.isPending}>
          {submitMutation.isPending ? (
            <>
              <Spinner />
              <span>Submitting…</span>
            </>
          ) : (
            "Submit for Review →"
          )}
        </Button>
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
            isLoading={suggestMutation.isPending}
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
              onRevert={(index) => revertMutation.mutate(index)}
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
        </div>
      </div>
    </div>
  );
}
