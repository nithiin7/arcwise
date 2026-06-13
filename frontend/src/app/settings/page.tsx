"use client";

import Link from "next/link";
import { ProviderCard } from "@/components/settings/ProviderCard";
import { PROVIDERS } from "@/constants/settings";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "48px 24px",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-text-muted)",
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>Settings</h1>
        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle inline />
        </div>
      </div>

      {/* API Keys section */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
          API Keys
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-faint)", marginBottom: 20 }}>
          Keys are saved locally in your browser and sent only to the Arcwise backend for your session.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PROVIDERS.map((p) => (
            <ProviderCard key={p.field} provider={p} />
          ))}
        </div>
      </div>

      {/* Ollama section */}
      <div>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
          Local Models (Ollama)
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-text-faint)", marginBottom: 16 }}>
          No API key required. Ollama must be running locally on port 11434.
        </p>
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)", display: "block", marginBottom: 4 }}>
              Ollama
            </span>
            <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
              llama3.2, llama3.1, mistral, qwen2.5, deepseek-r1
            </span>
          </div>
          <ol style={{ fontSize: 13, color: "var(--color-text-faint)", paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
            <li>
              Install Ollama from{" "}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-primary)", textDecoration: "none" }}
              >
                ollama.com
              </a>
            </li>
            <li>
              Pull a model:{" "}
              <code style={{ fontFamily: "monospace", fontSize: 12, background: "var(--color-surface-offset)", padding: "1px 5px", borderRadius: 3 }}>
                ollama pull llama3.2
              </code>
            </li>
            <li>Select an Ollama model from the dropdown on the home page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
