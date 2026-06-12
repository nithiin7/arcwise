"use client";

import Link from "next/link";
import { motion } from "framer-motion";

function LogoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="8" height="8" rx="2" fill="#6366f1" />
      <rect x="10" y="0" width="8" height="8" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="0" y="10" width="8" height="8" rx="2" fill="#6366f1" opacity="0.7" />
      <rect x="10" y="10" width="8" height="8" rx="2" fill="#6366f1" opacity="0.4" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI-Guided Architecture",
    description: "Describe any system and get a complete architecture walkthrough — from components to trade-offs.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-3 3v-3z" />
      </svg>
    ),
    title: "Smart Clarification",
    description: "Before designing, the AI asks targeted questions to sharpen your requirements and assumptions.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Mermaid Diagrams",
    description: "Visual system diagrams generated automatically. Edit, refine, and export with ease.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    title: "Iterative Refinement",
    description: "Chat directly with the AI to adjust your diagram — add components, change flows, explore alternatives.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
      </svg>
    ),
    title: "Scored Review",
    description: "Get evaluated across 5 key dimensions — scalability, reliability, cost, security, and simplicity.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Revision History",
    description: "Every iteration is saved. Browse past diagram versions and pick up any session where you left off.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Multi-Model Support",
    description: "Choose from Claude, GPT-4, Gemini, Grok, Llama, and more. Mix models across sessions.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: "Session Dashboard",
    description: "All your designs in one place. Track progress, scores, and jump back in at any stage.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(var(--color-bg-raw, 250,250,250), 0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "var(--color-text)",
            }}
          >
            Arcwise
          </span>
        </div>
        <Link
          href="/dashboard"
          style={{
            padding: "7px 18px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-primary)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
        >
          Open App
        </Link>
      </nav>

      {/* Hero */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "100px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 700,
              height: 700,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)",
              filter: "blur(48px)",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "relative", zIndex: 10, maxWidth: 680 }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: 999,
              border: "1px solid rgba(99,102,241,0.35)",
              background: "rgba(99,102,241,0.08)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-primary)",
              marginBottom: 28,
              letterSpacing: "0.02em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "inline-block",
              }}
            />
            AI-powered system design practice
          </div>

          <h1
            className="heading-gradient"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 3.75rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}
          >
            Master system design
            <br />
            with an AI coach
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2.5vw, 17px)",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 480,
              margin: "0 auto 40px",
            }}
          >
            Describe a system. Get clarifying questions, an architecture diagram,
            iterative refinement, and a scored review — all in one flow.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-primary)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                transition: "opacity 0.15s, transform 0.15s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              Start designing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 28px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-muted)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-primary)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-border)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)";
              }}
            >
              See features
            </a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "var(--color-text-faint)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "bounce 2s infinite" }}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          padding: "80px 24px 100px",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              marginBottom: 12,
            }}
          >
            Everything you need
          </p>
          <h2
            className="heading-gradient"
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            A full design loop, end to end
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 1,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: "var(--color-border)",
          }}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              style={{
                background: "var(--color-surface)",
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--color-text)",
                    marginBottom: 6,
                  }}
                >
                  {f.title}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA section */}
      <section
        style={{
          padding: "0 24px 100px",
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            textAlign: "center",
            padding: "60px 32px",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              height: 300,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
              filter: "blur(32px)",
              pointerEvents: "none",
            }}
          />
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              marginBottom: 16,
            }}
          >
            Ready to start?
          </p>
          <h2
            className="heading-gradient"
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Design your first system now
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-muted)",
              marginBottom: 32,
              maxWidth: 400,
              margin: "0 auto 32px",
            }}
          >
            Pick any system — URL shortener, Twitter, Netflix — and the AI will walk you through the full architecture.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-primary)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              transition: "opacity 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Go to dashboard
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>
            Arcwise
          </span>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
          AI-powered system design coach
        </p>
        <Link
          href="/settings"
          style={{ fontSize: 12, color: "var(--color-text-faint)", textDecoration: "none" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-faint)")}
        >
          Settings
        </Link>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
