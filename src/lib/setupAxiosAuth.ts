import axios, { AxiosRequestConfig } from "axios";
import { serverApi, tableApiBase } from "./config";
import { getStoredAccessToken } from "./accessToken";

let attached = false;

function isAppApiUrl(url: string): boolean {
  return url.startsWith(serverApi) || url.startsWith(tableApiBase);
}

/**
 * Bearer token (localStorage accessToken) + withCredentials (cookie) —
 * GET /table/all, POST /order/link va boshqalar uchun backend `occupiedByMe` / member tekshiruvlari bilan uyg‘un.
 */
export function setupAxiosAuth(): void {
  if (attached) return;
  attached = true;

  axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const url = config.url ?? "";
    if (!isAppApiUrl(url)) {
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
