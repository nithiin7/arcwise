import type { Review } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function streamReviewDesign(
  sessionId: string,
  onChunk: (text: string) => void,
): Promise<Review> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
      const event = JSON.parse(dataLine.slice(6)) as { type: string; text?: string; review?: Review; message?: string };
      if (event.type === "chunk" && event.text) {
        onChunk(event.text);
      } else if (event.type === "done" && event.review) {
        return event.review;
      } else if (event.type === "error") {
        throw new Error(event.message ?? "Review failed");
      }
    }
  }

  throw new Error("Review stream ended unexpectedly");
}
