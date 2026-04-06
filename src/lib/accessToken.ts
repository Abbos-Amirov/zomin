/** Stored separately from memberData; sent as Bearer on API calls. */
export const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function setStoredAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

/** Parse signup/login response: expects `{ member, accessToken }` or `{ token }`. */
export function persistAccessTokenFromAuthPayload(data: unknown): void {
  if (!data || typeof data !== "object") return;
  const d = data as Record<string, unknown>;
  const direct =
    (typeof d.accessToken === "string" && d.accessToken) ||
    (typeof d.token === "string" && d.token) ||
    null;
  if (direct) {
    setStoredAccessToken(direct);
    return;
  }
  const member = d.member;
  if (member && typeof member === "object") {
    const m = member as Record<string, unknown>;
    const nested =
      (typeof m.accessToken === "string" && m.accessToken) ||
      (typeof m.token === "string" && m.token) ||
      null;
    if (nested) setStoredAccessToken(nested);
  }
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}
