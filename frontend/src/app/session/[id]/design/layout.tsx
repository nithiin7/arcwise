import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture Design",
  description: "View and refine your AI-generated system architecture diagram. Chat with the AI to iterate on components and flows.",
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
