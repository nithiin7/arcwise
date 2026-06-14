import type { BadgeAward, Review } from "@/types";

export interface ReviewResult {
  review: Review;
  newBadges: BadgeAward[];
}

export async function streamReviewDesign(
  sessionId: string,
  onChunk: (text: string) => void,
): Promise<ReviewResult> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("arcwise-auth");
      const token = raw ? (JSON.parse(raw)?.state?.token as string | null) : null;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // ignore parse errors
    }
  }
  const response = await fetch(`${apiBase}/sessions/${sessionId}/review`, {
    method: "POST",
    headers,
  });
  if (!response.ok || !response.body) {
    const detail = await response.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail ?? response.statusText);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const dataLine = part.split("\n").find((l) => l.startsWith("data: "));
      if (!dataLine) continue;
      const event = JSON.parse(dataLine.slice(6)) as {
        type: string;
        text?: string;
        review?: Review;
        new_badges?: BadgeAward[];
        message?: string;
      };
      if (event.type === "chunk" && event.text) {
        onChunk(event.text);
      } else if (event.type === "done" && event.review) {
        return { review: event.review, newBadges: event.new_badges ?? [] };
      } else if (event.type === "error") {
        throw new Error(event.message ?? "Review failed");
      }
    }
  }

  throw new Error("Review stream ended unexpectedly");
}
