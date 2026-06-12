import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(undefined, (err) => {
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
