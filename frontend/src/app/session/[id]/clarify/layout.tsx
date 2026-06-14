import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clarify Requirements",
  description: "Answer AI-generated questions to sharpen your requirements before generating an architecture diagram.",
};

export default function ClarifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
