import axios, { AxiosHeaders, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getIdToken } from "./lib/auth";


const baseURL = "https://proyecto-pi-1-backend.onrender.com/api";

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
