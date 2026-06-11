import type { Review } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

export interface CreateSessionResponse {
  session_id: string;
  problem: string;
  questions: string[];
}

export function createSession(problem: string): Promise<CreateSessionResponse> {
  return request<CreateSessionResponse>("/sessions", {
    method: "POST",
    body: JSON.stringify({ problem }),
  });
}

export interface SuggestArchitectureResponse {
  explanation: string;
  mermaid_dsl: string;
  component_justifications: Record<string, string>;
  scale_assumption: string;
}

export function submitClarifications(
  sessionId: string,
  answers: string[],
  userScale?: string,
): Promise<void> {
  return request<void>(`/sessions/${sessionId}/clarifications`, {
    method: "POST",
    body: JSON.stringify({ answers, user_scale: userScale }),
  });
}

export function suggestArchitecture(
  sessionId: string,
): Promise<SuggestArchitectureResponse> {
  return request<SuggestArchitectureResponse>(
    `/sessions/${sessionId}/architecture/suggest`,
    { method: "POST" },
  );
}

export interface RefineArchitectureResponse {
  updated_mermaid: string;
  diff_summary: string;
  revision_index: number;
}

export function refineArchitecture(
  sessionId: string,
  message: string,
): Promise<RefineArchitectureResponse> {
  return request<RefineArchitectureResponse>(
    `/sessions/${sessionId}/architecture/refine`,
    { method: "POST", body: JSON.stringify({ message }) },
  );
}

export interface RevertRevisionResponse {
  mermaid: string;
}

export function revertRevision(
  sessionId: string,
  revisionIndex: number,
): Promise<RevertRevisionResponse> {
  return request<RevertRevisionResponse>(
    `/sessions/${sessionId}/architecture/revert`,
    { method: "POST", body: JSON.stringify({ revision_index: revisionIndex }) },
  );
}

export function submitArchitecture(
  sessionId: string,
  userDescription?: string,
): Promise<void> {
  return request<void>(`/sessions/${sessionId}/architecture/submit`, {
    method: "POST",
    body: JSON.stringify({ user_description: userDescription }),
  });
}

export function reviewDesign(sessionId: string): Promise<Review> {
  return request<Review>(`/sessions/${sessionId}/review`, { method: "POST" });
}
