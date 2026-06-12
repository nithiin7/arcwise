"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Spinner from "@/components/icons/Spinner";

export default function ClarifyPage() {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);

  const questions = session?.clarifications.map((c) => c.question) ?? [];
  const totalSteps = questions.length + 1; // questions + scale step

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => Array(questions.length).fill(""));
  const [userScale, setUserScale] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scaleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [session, router]);

  useEffect(() => {
    if (step < questions.length) {
      textareaRef.current?.focus();
    } else {
      scaleInputRef.current?.focus();
    }
  }, [step, questions.length]);

  if (!session) return null;

  const isLastQuestion = step === questions.length - 1;
  const isScaleStep = step === questions.length;
  const currentAnswer = step < questions.length ? answers[step] : "";

  function updateAnswer(value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = value;
      return next;
    });
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  async function handleNext() {
    if (isScaleStep) {
      await handleFinalSubmit();
      return;
    }
    if (!answers[step].trim()) return;
    if (isLastQuestion) {
      setStep((s) => s + 1);
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleFinalSubmit() {
    if (loading) return;
    setLoading(true);
    try {
      await api.submitClarifications(
        session!.id,
        answers,
        userScale.trim() || undefined,
      );
      setSession({
        ...session!,
        clarifications: session!.clarifications.map((c, i) => ({
          question: c.question,
          answer: answers[i] ?? "",
        })),
        user_scale: userScale.trim() || undefined,
        status: "designing",
      });
      router.push(`/session/${session!.id}/design`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const progressFill = ((step + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8" style={{ background: "var(--color-bg)" }}>
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-10">
        <div
          style={{
            display: "flex",
            gap: 4,
          }}
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 999,
                background: "var(--color-surface-offset)",
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background: "var(--color-primary)",
                  borderRadius: 999,
                }}
                initial={{ width: "0%" }}
                animate={{ width: i < step + 1 ? "100%" : i === step ? `${progressFill > 0 ? 100 : 0}%` : "0%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1 items-center justify-center w-full max-w-2xl">
        {/* Problem label */}
        <div className="w-full mb-2">
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-text-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {session.problem}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {!isScaleStep ? (
            <motion.div
              key={step}
              className="w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Question indicator */}
              <div className="mb-3">
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-primary)",
                  }}
                >
                  Question {step + 1} of {questions.length}
                </span>
              </div>

              {/* Question text */}
              <h2
                style={{
                  fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  lineHeight: 1.3,
                  marginBottom: 20,
                }}
              >
                {questions[step]}
              </h2>

              {/* Option chips */}
              {session.clarifications[step]?.options?.length ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {session.clarifications[step].options!.map((opt, i) => {
                    const selected = answers[step] === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => updateAnswer(selected ? "" : opt)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          border: `1px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                          background: selected ? "rgba(99,102,241,0.1)" : "var(--color-surface)",
                          color: selected ? "var(--color-primary)" : "var(--color-text-muted)",
                          fontSize: 13,
                          fontFamily: "inherit",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {/* Answer textarea */}
              <Textarea
                ref={textareaRef}
                rows={4}
                value={answers[step]}
                onChange={(e) => updateAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleNext();
                  }
                }}
                placeholder="Your answer…"
                style={{ marginBottom: 16 }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="scale"
              className="w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    overflow: "hidden",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 20px 24px",
                    marginBottom: 16,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 16 }}>📊</span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--color-text)",
                      }}
                    >
                      Approximate scale
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--color-text-faint)",
                        background: "var(--color-surface-offset)",
                        padding: "2px 8px",
                        borderRadius: 999,
                        marginLeft: 4,
                      }}
                    >
                      optional
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      marginBottom: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    Help the AI calibrate its architecture suggestions to your target scale.
                  </p>
                  <Input
                    ref={scaleInputRef}
                    type="text"
                    value={userScale}
                    onChange={(e) => setUserScale(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFinalSubmit();
                      }
                    }}
                    placeholder="Daily Active Users…"
                    style={{ width: "100%", background: "var(--color-surface-2)", fontSize: 14, padding: "10px 12px" }}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between w-full mt-2">
          <Button variant="secondary" size="md" onClick={handleBack} disabled={step === 0}>
            ← Back
          </Button>

          {isScaleStep ? (
            <Button
              size="md"
              onClick={handleFinalSubmit}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <><Spinner /><span>Generating…</span></> : "Generate Architecture →"}
            </Button>
          ) : (
            <Button size="md" onClick={handleNext} disabled={!answers[step]?.trim()}>
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
