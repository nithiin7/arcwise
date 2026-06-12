"use client";

import ErrorView from "@/components/ErrorView";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView message={error.message} reset={reset} />;
}
