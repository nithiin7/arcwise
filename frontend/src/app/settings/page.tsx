"use client";

import Link from "next/link";
import { ProviderCard } from "@/components/settings/ProviderCard";
import { PROVIDERS } from "@/constants/settings";
import { AppearanceSetting } from "@/components/settings/AppearanceSetting";
import { ModelSetting } from "@/components/settings/ModelSetting";
import { DiagramSetting } from "@/components/settings/DiagramSetting";
import { SmellDetectionSetting } from "@/components/settings/SmellDetectionSetting";
import { DataSetting } from "@/components/settings/DataSetting";

const NAV = [
  { id: "appearance", label: "Appearance", group: "Preferences" },
  { id: "model", label: "Model", group: "Preferences" },
  { id: "diagram", label: "Diagram", group: "Preferences" },
  { id: "analysis", label: "Analysis", group: "Preferences" },
  { id: "api-keys", label: "API Keys", group: "API" },
  { id: "local-models", label: "Local Models", group: "API" },
  { id: "data", label: "Storage", group: "Data" },
];

const GROUPS = ["Preferences", "API", "Data"];

export default function SettingsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Top nav bar */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          padding: "0 32px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--color-text-faint)",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-faint)")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Dashboard
        </Link>
        <span style={{ color: "var(--color-border)", fontSize: 16 }}>/</span>
        <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>Settings</span>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "48px 32px",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 48,
          alignItems: "start",
        }}
      >
        {/* ── Left nav ── */}
        <nav style={{ position: "sticky", top: 48 }}>
          {GROUPS.map((group) => {
            const items = NAV.filter((n) => n.group === group);
            return (
              <div key={group} style={{ marginBottom: 24 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "var(--color-text-faint)",
                    marginBottom: 6,
                    padding: "0 8px",
                  }}
                >
                  {group}
                </p>
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    style={{
                      display: "block",
                      padding: "6px 8px",
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      textDecoration: "none",
                      borderRadius: "var(--radius-sm)",
                      transition: "background 0.12s, color 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-surface-2)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)";
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            );
          })}
        </nav>

        {/* ── Right content ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          <Section id="appearance" title="Appearance" description="Choose how Arcwise looks on your device.">
            <AppearanceSetting />
          </Section>

          <Section id="model" title="Model" description="Default AI model used for all new design sessions.">
            <ModelSetting />
          </Section>

          <Section id="diagram" title="Diagram" description="Layout direction for generated architecture diagrams.">
            <DiagramSetting />
          </Section>

          <Section id="analysis" title="Analysis" description="AI-powered analysis features that run during your design sessions.">
            <SmellDetectionSetting />
          </Section>

          <Section
            id="api-keys"
            title="API Keys"
            description="Keys are saved locally in your browser and sent only to the Arcwise backend for your sessions."
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PROVIDERS.map((p) => (
                <ProviderCard key={p.field} provider={p} />
              ))}
            </div>
          </Section>

          <Section
            id="local-models"
            title="Local Models"
            description="Run models locally via Ollama — no API key required. Ollama must be running on port 11434."
          >
            <div
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)", display: "block", marginBottom: 3 }}>
                  Ollama
                </span>
                <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
                  llama3.2 · llama3.1 · mistral · qwen2.5 · deepseek-r1
                </span>
              </div>
              <ol style={{ fontSize: 13, color: "var(--color-text-faint)", paddingLeft: 18, margin: 0, lineHeight: 1.9 }}>
                <li>
                  Install from{" "}
                  <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                    ollama.com
                  </a>
                </li>
                <li>
                  Pull a model:{" "}
                  <code style={{ fontFamily: "monospace", fontSize: 12, background: "var(--color-surface-offset)", padding: "1px 6px", borderRadius: 4 }}>
                    ollama pull llama3.2
                  </code>
                </li>
                <li>Select an Ollama model from the dropdown on the home page</li>
              </ol>
            </div>
          </Section>

          <Section id="data" title="Data" description="Manage your locally stored session data.">
            <DataSetting />
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} style={{ marginBottom: 4, scrollMarginTop: 24 }}>
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-faint)", marginBottom: description ? 3 : 0 }}>
          {title}
        </p>
        {description && (
          <p style={{ fontSize: 13, color: "var(--color-text-faint)" }}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
