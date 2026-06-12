import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Architecture Review",
  description: "Get a scored evaluation of your system design across scalability, reliability, cost, security, and simplicity.",
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
