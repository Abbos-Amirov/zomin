import axios, { AxiosRequestConfig } from "axios";
import { serverApi } from "./config";
import { getStoredAccessToken } from "./accessToken";

let attached = false;

/** Attaches Bearer token to requests targeting this app's API (same origin as serverApi). */
export function setupAxiosAuth(): void {
  if (attached) return;
  attached = true;

  axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const url = config.url ?? "";
    if (!url.startsWith(serverApi)) {
      return config;
    }
    const token = getStoredAccessToken();
    if (!token) {
      return config;
    }
    if (!config.headers) {
      config.headers = {};
    }
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    return config;
  });
}
