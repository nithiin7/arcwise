import axios from "axios";
import type { OllamaModel } from "@/types";

const ollamaClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_OLLAMA_URL ?? "http://localhost:11434",
});

type OllamaTagEntry = {
  name: string;
  details?: { family?: string; parameter_size?: string };
};

export async function getOllamaModels(): Promise<OllamaModel[]> {
  try {
    const { data } = await ollamaClient.get<{ models: OllamaTagEntry[] }>("/api/tags");
    return (data.models ?? [])
      .filter((m) => {
        const family = (m.details?.family ?? "").toLowerCase();
        return !family.includes("bert") && !m.name.toLowerCase().includes("embed");
      })
      .map((m) => ({
        name: m.name,
        paramSize: m.details?.parameter_size ?? "",
      }));
  } catch {
    return [];
  }
}
