import axios, { AxiosHeaders } from "axios";
import { getIdToken } from "./auth";
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
});
api.interceptors.request.use(async (config) => {
    const token = await getIdToken();
    if (token) {
        const headers = AxiosHeaders.from(config.headers || {});
        headers.set("Authorization", `Bearer ${token}`);
        config.headers = headers;
    }
    return config;
});
api.interceptors.response.use((r) => r, async (err) => {
    if (err?.response?.status === 401) {
        const token = await getIdToken();
        if (token) {
            const headers = AxiosHeaders.from(err.config.headers || {});
            headers.set("Authorization", `Bearer ${token}`);
            err.config.headers = headers;
            return api.request(err.config);
        }
    }
    return Promise.reject(err);
});
