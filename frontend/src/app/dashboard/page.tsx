"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import ModelSelect from "@/components/ModelSelect";
import SessionCard from "@/components/SessionCard";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import GearIcon from "@/components/icons/GearIcon";
import LogoMark from "@/components/icons/LogoMark";
import Spinner from "@/components/icons/Spinner";
import { EXAMPLES, MODEL_GROUPS } from "@/constants/dashboard";
import * as api from "@/api";
import { updateSessionTags } from "@/api/sessions";
import { createSessionSchema, type CreateSessionForm } from "@/lib/schemas";
import { useSessionStore } from "@/store/sessionStore";
import { useSettingsStore } from "@/store/settingsStore";
import type { Session } from "@/types";

const HISTORY_PAGE_SIZE = 5;

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useSessionStore((s) => s.setSession);
  const getKeyForModel = useSettingsStore((s) => s.getKeyForModel);
  const model = useSettingsStore((s) => s.selectedModel);
  const setModel = useSettingsStore((s) => s.setSelectedModel);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);

  const {
    register,
    handleSubmit: rhfSubmit,
    setValue,
    formState: { isValid: isProblemValid },
  } = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: { problem: "" },
    mode: "onChange",
  });

  const storedKey = getKeyForModel(model);
  const isLocalModel = model.startsWith("ollama/");
  const missingKey = !storedKey && !isLocalModel;

  const { data: history = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: api.listSessions,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { problem: string; model: string; apiKey?: string }) =>
      api.createSession(vars.problem, vars.model, vars.apiKey),
    onSuccess: (res) => {
      const session: Session = {
        id: res.session_id,
        problem: res.problem,
        model: res.model,
        clarifications: res.questions.map((q) => ({
          question: q.question,
          answer: "",
          options: q.options,
        })),
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
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
    onError: () => toast.error("Failed to delete session."),
  });

  const tagsMutation = useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => updateSessionTags(id, tags),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sessions"] }),
    onError: () => toast.error("Failed to update tags."),
  });

  const canSubmit = isProblemValid && !createMutation.isPending && !missingKey;

  const allTags = Array.from(new Set(history.flatMap((s) => s.tags))).sort();

  const filteredHistory = history.filter((s) => {
    const matchesSearch =
      search === "" || s.problem.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      activeTagFilters.length === 0 ||
      activeTagFilters.every((t) => s.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  const isFiltering = search !== "" || activeTagFilters.length > 0;

  function toggleTagFilter(tag: string) {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function onFormSubmit(data: CreateSessionForm) {
    createMutation.mutate({ problem: data.problem, model, apiKey: storedKey || undefined });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) rhfSubmit(onFormSubmit)();
    }
  }

  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-4">
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
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-faint)")
        }
      >
        <GearIcon />
        Settings
      </Link>

      <motion.div
        className="relative z-10 flex w-full max-w-2xl flex-col items-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo + name */}
        <div className="mb-8 flex items-center gap-2">
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
          className="heading-gradient"
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            textAlign: "center",
            marginBottom: 12,
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
          <Textarea
            {...register("problem")}
            rows={3}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Design a URL shortener like bit.ly…"
            bordered={false}
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
            <ModelSelect
              groups={MODEL_GROUPS}
              value={model}
              onChange={(v) => setModel(v)}
            />

            {/* Hints */}
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
            {isLocalModel && (
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: "var(--color-text-faint)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Runs via Ollama on localhost:11434
              </span>
            )}

            {/* Spacer when no hint */}
            {!missingKey && !isLocalModel && <div style={{ flex: 1 }} />}

            {/* Submit button */}
            <Button onClick={rhfSubmit(onFormSubmit)} disabled={!canSubmit}>
              {createMutation.isPending ? (
                <>
                  <Spinner />
                  <span>Thinking…</span>
                </>
              ) : (
                "Submit ↵"
              )}
            </Button>
          </div>
        </div>

        {/* Example pills */}
        <div className="flex flex-wrap justify-center gap-2" style={{ marginTop: 16 }}>
          {EXAMPLES.map((ex, i) => (
            <motion.button
              key={ex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setValue("problem", ex, { shouldValidate: true })}
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

        {/* Recent designs */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ width: "100%", marginTop: 44 }}
          >
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-text-faint)",
                  margin: 0,
                }}
              >
                Recent designs
              </p>

              {/* Search input */}
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowAll(true);
                }}
                placeholder="Search…"
                style={{
                  fontSize: 12,
                  color: "var(--color-text)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "4px 10px",
                  outline: "none",
                  width: 140,
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor =
                    "var(--color-primary)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor =
                    "var(--color-border)";
                }}
              />
            </div>

            {/* Tag filter pills */}
            {allTags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                {allTags.map((tag) => {
                  const active = activeTagFilters.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 999,
                        border: active
                          ? "1px solid var(--color-primary)"
                          : "1px solid var(--color-border)",
                        background: active ? "rgba(99,102,241,0.12)" : "transparent",
                        color: active ? "var(--color-primary)" : "var(--color-text-faint)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
                {activeTagFilters.length > 0 && (
                  <button
                    onClick={() => setActiveTagFilters([])}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: "none",
                      background: "transparent",
                      color: "var(--color-text-faint)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Session list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {(isFiltering || showAll
                ? filteredHistory
                : filteredHistory.slice(0, HISTORY_PAGE_SIZE)
              ).map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onTagsChange={(id, tags) => tagsMutation.mutate({ id, tags })}
                  deleteDisabled={deleteMutation.isPending}
                />
              ))}
              {isFiltering && filteredHistory.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--color-text-faint)", textAlign: "center", padding: "16px 0" }}>
                  No sessions match.
                </p>
              )}
            </div>

            {!isFiltering && filteredHistory.length > HISTORY_PAGE_SIZE && (
              <button
                onClick={() => setShowAll((v) => !v)}
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: "7px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "transparent",
                  color: "var(--color-text-faint)",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "color 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-faint)";
                }}
              >
                {showAll
                  ? "Show less"
                  : `Show ${filteredHistory.length - HISTORY_PAGE_SIZE} more`}
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
