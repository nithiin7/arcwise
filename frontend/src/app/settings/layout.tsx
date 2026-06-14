import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure your API keys and preferences for Claude, GPT-4, Gemini, and other AI models.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
