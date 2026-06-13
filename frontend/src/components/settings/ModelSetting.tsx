"use client";

import ModelSelect from "@/components/ModelSelect";
import { MODEL_GROUPS } from "@/constants/dashboard";
import { useSettingsStore } from "@/store/settingsStore";

export function ModelSetting() {
  const model = useSettingsStore((s) => s.selectedModel);
  const setModel = useSettingsStore((s) => s.setSelectedModel);

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
          Default Model
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
          Used for all new design sessions
        </span>
      </div>
      <ModelSelect groups={MODEL_GROUPS} value={model} onChange={setModel} direction="down" />
    </div>
  );
}
