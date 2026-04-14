/**
 * Stollar ro‘yxati o‘zgaganda backend WebSocket orqali xabar yuboradi —
 * har qanday xabar kelganda `onTablesChanged` chaqiriladi (odatda GET /table/all).
 *
 * URL: `REACT_APP_TABLE_WS_URL` (masalan `ws://localhost:4009/ws/tables`).
 */

const DEBOUNCE_MS = 250;

export function subscribeTableListUpdates(
  wsUrl: string | undefined,
  enabled: boolean,
  onTablesChanged: () => void
): () => void {
  if (!wsUrl || !enabled) {
    return () => {};
  }

  let ws: WebSocket | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let attempt = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const debounced = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onTablesChanged();
    }, DEBOUNCE_MS);
  };

  const connect = () => {
    if (closed) return;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        attempt = 0;
        /** Ulanish bilan darhol yangi ro‘yxat (server hali xabar yubormagan bo‘lsa ham) */
        debounced();
      };
      ws.onmessage = () => {
        debounced();
      };
      ws.onerror = () => {
        try {
          ws?.close();
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        ws = null;
        if (closed) return;
        const delay = Math.min(30_000, 1000 * Math.pow(2, Math.min(attempt++, 5)));
        reconnectTimer = setTimeout(connect, delay);
      };
    } catch {
      if (!closed) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    }
  };

  connect();

  return () => {
    closed = true;
    clearTimeout(reconnectTimer);
    clearTimeout(debounceTimer);
    try {
      ws?.close();
    } catch {
      /* ignore */
    }
    ws = null;
  };
}
