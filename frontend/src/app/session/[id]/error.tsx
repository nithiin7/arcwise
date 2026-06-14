"use client";

import ErrorView from "@/components/ErrorView";

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView
      message={error.message || "Failed to load the session. It may have been deleted or the backend is unavailable."}
      reset={reset}
      backLabel="Back to home"
    />
  );
}
