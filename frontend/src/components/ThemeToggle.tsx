"use client";

import { useSettingsStore } from "@/store/settingsStore";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 1.5v1M7.5 12.5v1M1.5 7.5h-1M14.5 7.5h-1M3.318 3.318l-.707-.707M12.389 12.389l-.707-.707M12.389 3.318l.707-.707M3.318 12.389l-.707.707M10 7.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 2.5A5.5 5.5 0 0 0 12.5 9c0 .304-.025.602-.073.893A5.5 5.5 0 1 1 6 2.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
        top: 16,
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
