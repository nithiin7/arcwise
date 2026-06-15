export interface ArchSmell {
  severity: "critical" | "warning";
  title: string;
  component: string;
  hint: string;
}

export async function detectSmells(sessionId: string): Promise<ArchSmell[]> {
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
  const response = await fetch(`${apiBase}/sessions/${sessionId}/smells`, {
    method: "POST",
    headers,
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error((detail as { detail?: string }).detail ?? response.statusText);
  }
  const data = (await response.json()) as { smells: ArchSmell[] };
  return data.smells;
}
