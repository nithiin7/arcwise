"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ProviderKeys {
  anthropicKey: string;
  openaiKey: string;
  geminiKey: string;
  xaiKey: string;
  groqKey: string;
}

type Theme = "light" | "dark" | "system";

interface SettingsState extends ProviderKeys {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  selectedModel: string;
  diagramDirection: "LR" | "TD";
  smellDetectionEnabled: boolean;
  setKey: (field: keyof ProviderKeys, value: string) => void;
  getKeyForModel: (model: string) => string;
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: "light" | "dark") => void;
  setSelectedModel: (model: string) => void;
  setDiagramDirection: (direction: "LR" | "TD") => void;
  setSmellDetectionEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      anthropicKey: "",
      openaiKey: "",
      geminiKey: "",
      xaiKey: "",
      groqKey: "",
      theme: "system",
      resolvedTheme: "light",
      selectedModel: "claude-sonnet-4-6",
      diagramDirection: "LR",
      smellDetectionEnabled: false,

      setKey: (field, value) => set({ [field]: value }),
      setTheme: (theme) => set({ theme }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setDiagramDirection: (diagramDirection) => set({ diagramDirection }),
      setSmellDetectionEnabled: (smellDetectionEnabled) => set({ smellDetectionEnabled }),

      getKeyForModel: (model) => {
        const s = get();
        if (model.startsWith("ollama/")) return "";
        if (model.startsWith("claude") || model.startsWith("anthropic/")) return s.anthropicKey;
        if (
          model.startsWith("gpt-") ||
          model.startsWith("o1") ||
          model.startsWith("o3") ||
          model.startsWith("o4") ||
          model.startsWith("openai/")
        )
          return s.openaiKey;
        if (model.startsWith("gemini/") || model.startsWith("google/")) return s.geminiKey;
        if (model.startsWith("xai/")) return s.xaiKey;
        if (model.startsWith("groq/")) return s.groqKey;
        return "";
      },
    }),
    {
      name: "arcwise-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        anthropicKey: s.anthropicKey,
        openaiKey: s.openaiKey,
        geminiKey: s.geminiKey,
        xaiKey: s.xaiKey,
        groqKey: s.groqKey,
        theme: s.theme,
        selectedModel: s.selectedModel,
        diagramDirection: s.diagramDirection,
        smellDetectionEnabled: s.smellDetectionEnabled,
      }),
    }
  )
);
