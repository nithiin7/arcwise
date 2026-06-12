"use client";

import { useSettingsStore } from "@/store/settingsStore";
import SunIcon from "@/components/icons/SunIcon";
import MoonIcon from "@/components/icons/MoonIcon";

export function ThemeToggle() {
  const resolvedTheme = useSettingsStore((s) => s.resolvedTheme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "fixed",
        bottom: 16,
        left: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        color: "var(--color-text-muted)",
        cursor: "pointer",
        zIndex: 20,
        transition: "color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-muted)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface)";
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
