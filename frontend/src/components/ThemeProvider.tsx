"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const setResolvedTheme = useSettingsStore((s) => s.setResolvedTheme);

  useEffect(() => {
    function apply(resolved: "light" | "dark") {
      setResolvedTheme(resolved);
      if (resolved === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }

    function resolve(): "light" | "dark" {
      if (theme === "dark") return "dark";
      if (theme === "light") return "light";
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    apply(resolve());

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => apply(e.matches ? "dark" : "light");
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [theme, setResolvedTheme]);

  return <>{children}</>;
}
