"use client";

import { useSettingsStore } from "@/store/settingsStore";

type Theme = "light" | "system" | "dark";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

export function AppearanceSetting() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)", display: "block", marginBottom: 4 }}>
          Theme
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
          {theme === "system" ? "Follows your OS preference" : theme === "dark" ? "Dark theme active" : "Light theme active"}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          background: "var(--color-surface-offset)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          padding: 3,
          gap: 2,
          flexShrink: 0,
        }}
      >
        {OPTIONS.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                borderRadius: "calc(var(--radius-sm) - 2px)",
                border: "none",
                cursor: "pointer",
                background: active ? "var(--color-surface-2)" : "transparent",
                color: active ? "var(--color-text)" : "var(--color-text-muted)",
                transition: "background 0.15s, color 0.15s",
                outline: "none",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
