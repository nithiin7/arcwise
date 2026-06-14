"use client";

import ErrorView from "@/components/ErrorView";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView
      title="Settings failed to load"
      message={error.message}
      reset={reset}
      backLabel="Go home"
    />
  );
}
