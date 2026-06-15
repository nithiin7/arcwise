import { post, patch } from "@/lib/api";
import type { BadgeAward } from "@/types";

export interface SuggestArchitectureResponse {
  explanation: string;
  mermaid_dsl: string;
  component_justifications: Record<string, string>;
  scale_assumption: string;
}

export interface RefineArchitectureResponse {
  updated_mermaid: string;
  diff_summary: string;
  revision_index: number;
  new_badges: BadgeAward[];
}

export interface SubmitArchitectureResponse {
  status: string;
  new_badges: BadgeAward[];
}

export interface RevertRevisionResponse {
  mermaid: string;
}

export function suggestArchitecture(
  sessionId: string,
  diagramDirection?: string,
  templateId?: string,
): Promise<SuggestArchitectureResponse> {
  const body: Record<string, string> = {};
  if (diagramDirection) body.diagram_direction = diagramDirection;
  if (templateId) body.template_id = templateId;
  return post(`/sessions/${sessionId}/architecture/suggest`, Object.keys(body).length ? body : undefined);
}

export function refineArchitecture(
  sessionId: string,
  message: string,
): Promise<RefineArchitectureResponse> {
  return post(`/sessions/${sessionId}/refine`, { message });
}

export function revertRevision(
  sessionId: string,
  revisionIndex: number,
): Promise<RevertRevisionResponse> {
  return post(`/sessions/${sessionId}/refine/revert/${revisionIndex}`);
}

export function updateMermaid(sessionId: string, mermaid: string): Promise<{ ok: boolean }> {
  return patch(`/sessions/${sessionId}/architecture/mermaid`, { mermaid });
}

export function submitArchitecture(
  sessionId: string,
  userDescription?: string,
): Promise<SubmitArchitectureResponse> {
  return post(`/sessions/${sessionId}/architecture/submit`, {
    user_description: userDescription,
  });
}

export async function streamFollowUpQA(
  sessionId: string,
  question: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("arcwise-auth");
      const token = raw ? (JSON.parse(raw)?.state?.token as string | null) : null;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // ignore
    }
  }
  const response = await fetch(`${apiBase}/sessions/${sessionId}/qa`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question }),
  });
  if (!response.ok || !response.body) {
    const detail = await response.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail ?? response.statusText);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullAnswer = "";

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
        message?: string;
      };
      if (event.type === "chunk" && event.text) {
        fullAnswer += event.text;
        onChunk(event.text);
      } else if (event.type === "done") {
        return fullAnswer;
      } else if (event.type === "error") {
        throw new Error(event.message ?? "Q&A failed");
      }
    }
  }

  return fullAnswer;
}
