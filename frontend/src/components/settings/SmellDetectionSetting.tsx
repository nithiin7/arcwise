"use client";

import { useSettingsStore } from "@/store/settingsStore";

export function SmellDetectionSetting() {
  const enabled = useSettingsStore((s) => s.smellDetectionEnabled);
  const setEnabled = useSettingsStore((s) => s.setSmellDetectionEnabled);

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
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "var(--color-text)",
            display: "block",
            marginBottom: 4,
          }}
        >
          Architecture Smell Detection
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
          After each refinement, scan the updated diagram for issues like single points of failure
          and god services. Uses LLM tokens.
        </span>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
        style={{
          position: "relative",
          width: 40,
          height: 22,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: enabled ? "var(--color-primary)" : "var(--color-border)",
          transition: "background 0.2s",
          flexShrink: 0,
          marginLeft: 24,
          padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: enabled ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s",
            display: "block",
          }}
        />
      </button>
    </div>
  );
}
