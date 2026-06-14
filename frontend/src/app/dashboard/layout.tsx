import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Start a new system design session or continue a previous one. Describe any system and get AI-guided architecture.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
