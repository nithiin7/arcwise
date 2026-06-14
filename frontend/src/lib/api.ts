import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  // Read token from localStorage (set by authStore)
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("arcwise-auth");
      const token = raw ? (JSON.parse(raw)?.state?.token as string | null) : null;
      if (token) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

client.interceptors.response.use(undefined, (err) => {
  if (err.response?.status === 401 && typeof window !== "undefined") {
    // Clear auth state and redirect to login
    try {
      localStorage.removeItem("arcwise-auth");
      document.cookie = "arcwise_token=; path=/; max-age=0; SameSite=Lax";
    } catch {
      // ignore
    }
    const isAuthPage = window.location.pathname.startsWith("/login") ||
      window.location.pathname.startsWith("/signup");
    if (!isAuthPage) {
      window.location.href = "/login";
    }
  }
  const detail = err.response?.data?.detail;
  return Promise.reject(
    new Error(typeof detail === "string" ? detail : (err.response?.statusText ?? err.message)),
  );
});

export async function get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const r = await client.get<T>(path, config);
  return r.data;
}

export async function post<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const r = await client.post<T>(path, data, config);
  return r.data;
}

export async function put<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const r = await client.put<T>(path, data, config);
  return r.data;
}

export async function patch<T>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const r = await client.patch<T>(path, data, config);
  return r.data;
}

export async function del<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const r = await client.delete<T>(path, config);
  return r.data;
}
