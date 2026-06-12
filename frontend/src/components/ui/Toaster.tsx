"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useSettingsStore } from "@/store/settingsStore";

export function Toaster() {
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
          fontFamily: "inherit",
        },
      }}
    />
  );
}
