"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";

interface Provider {
  label: string;
  field: "anthropicKey" | "openaiKey" | "geminiKey" | "xaiKey" | "groqKey";
  models: string;
  docsUrl: string;
  docsLabel: string;
}

const PROVIDERS: Provider[] = [
  {
    label: "Claude (Anthropic)",
    field: "anthropicKey",
    models: "claude-sonnet-4-6, claude-opus-4-8, claude-haiku-4-5",
    docsUrl: "https://console.anthropic.com/settings/keys",
    docsLabel: "console.anthropic.com",
  },
  {
    label: "OpenAI",
    field: "openaiKey",
    models: "gpt-4o, gpt-4o-mini",
    docsUrl: "https://platform.openai.com/api-keys",
    docsLabel: "platform.openai.com/api-keys",
  },
  {
    label: "Google Gemini",
    field: "geminiKey",
    models: "gemini-2.0-flash, gemini-1.5-pro",
    docsUrl: "https://aistudio.google.com/apikey",
    docsLabel: "aistudio.google.com/apikey",
  },
  {
    label: "xAI",
    field: "xaiKey",
    models: "grok-2",
    docsUrl: "https://console.x.ai",
    docsLabel: "console.x.ai",
  },
  {
    label: "Groq",
    field: "groqKey",
    models: "llama-3.3-70b-versatile, mixtral-8x7b",
    docsUrl: "https://console.groq.com/keys",
    docsLabel: "console.groq.com/keys",
  },
];

function ProviderCard({ provider }: { provider: Provider }) {
  const key = useSettingsStore((s) => s[provider.field]);
  const setKey = useSettingsStore((s) => s.setKey);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleChange(val: string) {
    setKey(provider.field, val);
    setSaved(false);
  }

  function handleBlur() {
    if (key) setSaved(true);
  }

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)", display: "block", marginBottom: 4 }}>
            {provider.label}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>{provider.models}</span>
        </div>
        {saved && key && (
          <span style={{ fontSize: 12, color: "var(--color-success)", flexShrink: 0 }}>
            Saved ✓
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type={visible ? "text" : "password"}
          value={key}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={`Paste your ${provider.label} API key`}
          autoComplete="off"
          style={{
            flex: 1,
            background: "var(--color-surface-offset)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text)",
            fontSize: 13,
            fontFamily: "inherit",
            padding: "8px 12px",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          title={visible ? "Hide" : "Show"}
          style={{
            background: "var(--color-surface-offset)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-muted)",
            fontSize: 13,
            padding: "8px 12px",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          {visible ? "Hide" : "Show"}
        </button>
        {key && (
          <button
            type="button"
            onClick={() => { setKey(provider.field, ""); setSaved(false); }}
            title="Clear"
            style={{
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-faint)",
              fontSize: 13,
              padding: "8px 12px",
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            Clear
          </button>
        )}
      </div>

      <p style={{ fontSize: 11, color: "var(--color-text-faint)", marginTop: 8 }}>
        Get your key at{" "}
        <a
          href={provider.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--color-primary)", textDecoration: "none" }}
        >
          {provider.docsLabel}
        </a>
      </p>
    </div>
  );
}

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
          href="/"
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
      </div>

      {/* API Keys section */}
      <div style={{ marginBottom: 8 }}>
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
    </div>
  );
}
