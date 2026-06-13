"use client";

import { useSettingsStore } from "@/store/settingsStore";

const OPTIONS: { value: "LR" | "TD"; label: string; description: string }[] = [
  { value: "LR", label: "Left → Right", description: "Horizontal flow" },
  { value: "TD", label: "Top → Down", description: "Vertical flow" },
];

export function DiagramSetting() {
  const diagramDirection = useSettingsStore((s) => s.diagramDirection);
  const setDiagramDirection = useSettingsStore((s) => s.setDiagramDirection);

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
          Diagram Direction
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
          Layout direction for generated architecture diagrams
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
          const active = diagramDirection === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setDiagramDirection(opt.value)}
              title={opt.description}
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
                whiteSpace: "nowrap",
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
