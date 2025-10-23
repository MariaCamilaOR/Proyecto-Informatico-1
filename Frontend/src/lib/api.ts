import axios from "axios";
import { getIdToken } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
});

api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err?.response?.status === 401) {
      const token = await getIdToken();
      if (token) {
        err.config.headers.Authorization = `Bearer ${token}`;
        return api.request(err.config);
      }
    }
    return Promise.reject(err);
  }
);