"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Provider } from "@/types";

export function ProviderCard({ provider }: { provider: Provider }) {
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
        <Input
          type={visible ? "text" : "password"}
          value={key}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={`Paste your ${provider.label} API key`}
          autoComplete="off"
          style={{ flex: 1, background: "var(--color-surface-offset)" }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => setVisible((v) => !v)}
          title={visible ? "Hide" : "Show"}
          style={{ background: "var(--color-surface-offset)" }}
        >
          {visible ? "Hide" : "Show"}
        </Button>
        {key && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => { setKey(provider.field, ""); setSaved(false); }}
            title="Clear"
          >
            Clear
          </Button>
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
