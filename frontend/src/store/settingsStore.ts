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

interface SettingsState extends ProviderKeys {
  setKey: (field: keyof ProviderKeys, value: string) => void;
  getKeyForModel: (model: string) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      anthropicKey: "",
      openaiKey: "",
      geminiKey: "",
      xaiKey: "",
      groqKey: "",

      setKey: (field, value) => set({ [field]: value }),

      getKeyForModel: (model) => {
        const s = get();
        if (model.startsWith("claude") || model.startsWith("anthropic/")) return s.anthropicKey;
        if (
          model.startsWith("gpt-") ||
          model.startsWith("o1") ||
          model.startsWith("o3") ||
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
    }
  )
);
