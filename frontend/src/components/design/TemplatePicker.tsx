"use client";

import { motion } from "framer-motion";

export interface Template {
  id: string;
  name: string;
  description: string;
  badge: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "monolith",
    name: "Monolith",
    description: "Single deployable service with a shared database and cache.",
    badge: "Simple ops",
  },
  {
    id: "microservices",
    name: "Microservices",
    description: "Independent services per domain behind an API gateway.",
    badge: "Scalable",
  },
  {
    id: "event-driven",
    name: "Event-Driven",
    description: "Services communicate via an event bus (Kafka / SQS).",
    badge: "Async",
  },
  {
    id: "serverless",
    name: "Serverless",
    description: "Functions triggered by HTTP or events. Zero infrastructure.",
    badge: "Pay-per-use",
  },
  {
    id: "cqrs",
    name: "CQRS",
    description: "Separate command and query paths for independent scaling.",
    badge: "Event sourcing",
  },
];

interface Props {
  onSelect: (templateId: string | undefined) => void;
}

export function TemplatePicker({ onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        backdropFilter: "blur(2px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "28px 28px 24px",
          width: 640,
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header */}
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
            Choose a starting template
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-faint)", margin: "4px 0 0" }}>
            The AI will customize it for your specific problem and clarifications.
          </p>
        </div>

        {/* Template grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-primary)";
                (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                (e.currentTarget as HTMLElement).style.background = "var(--color-bg)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>
                  {t.name}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(99,102,241,0.85)",
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 4,
                    padding: "2px 7px",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                >
                  {t.badge}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
                {t.description}
              </p>
            </button>
          ))}
        </div>

        {/* Skip */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => onSelect(undefined)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              color: "var(--color-text-faint)",
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-faint)";
            }}
          >
            Generate from scratch
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
