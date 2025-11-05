import axios, { AxiosHeaders } from "axios";
import { getIdToken } from "./auth";

// Normaliza baseURL (sin "/" final duplicado)
const base = (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000/api").replace(/\/+$/, "");
export const api = axios.create({ baseURL: base });

// Inyecta Bearer token en cada request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getIdToken();
    if (token) {
      const headers = AxiosHeaders.from(config.headers || {});
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }
  } catch (_) {
    // si falla obtener token, sigue sin auth (backend responderá 401)
  }
  return config;
});

// Reintento único en 401 (evita bucles infinitos)
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config || {};
    const status = err?.response?.status;

    if (status === 401 && !cfg.__isRetry) {
      cfg.__isRetry = true;
      const token = await getIdToken();
      if (token) {
        const headers = AxiosHeaders.from(cfg.headers || {});
        headers.set("Authorization", `Bearer ${token}`);
        cfg.headers = headers;
        return api.request(cfg);
      }
    }
    return Promise.reject(err);
  }
);
