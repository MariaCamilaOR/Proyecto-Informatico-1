import axios, { AxiosHeaders, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getIdToken } from "./lib/auth";

// VITE_API_BASE_URL YA incluye /api en producción (Render)
const raw = (import.meta.env.VITE_API_BASE_URL ?? "").toString().trim();
const baseURL = raw.replace(/\/+$/, "");
if (!baseURL) throw new Error("VITE_API_BASE_URL no está definida en build");

export const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  try {
    const token = await getIdToken();
    if (token) {
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const cfg = (error.config || {}) as InternalAxiosRequestConfig & { __isRetry?: boolean };
    if (error.response?.status === 401 && !cfg.__isRetry) {
      cfg.__isRetry = true;
      const token = await getIdToken();
      if (token) {
        const headers = AxiosHeaders.from(cfg.headers ?? {});
        headers.set("Authorization", `Bearer ${token}`);
        cfg.headers = headers;
        return api.request(cfg);
      }
    }
    return Promise.reject(error);
  }
);
