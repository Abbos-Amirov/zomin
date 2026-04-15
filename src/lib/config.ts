export const serverApi: string = process.env.REACT_APP_API_URL || "http://localhost:4009";

/**
 * GET /table/all — alohida host (ixtiyoriy).
 * Agar bo‘sh bo‘lsa, serverApi ishlatiladi.
 * Masalan: asosiy API VPSda, stollar ro‘yxati faqat localhostda bo‘lsa —
 * REACT_APP_TABLE_API_URL=http://localhost:4009
 */
export const tableApiBase: string =
  (process.env.REACT_APP_TABLE_API_URL && process.env.REACT_APP_TABLE_API_URL.trim()) ||
  serverApi;

/** Optional default for link-order flow; can still be edited in the form */
export const DEFAULT_RESTAURANT_ID: string = process.env.REACT_APP_RESTAURANT_ID || "";

/**
 * Backend: GET `{serverApi}/orders/all-member?memberId=...&page=&limit=`
 * — `/orders-link` sahifasidagi barcha buyurtmalar shu endpointdan.
 */
export const ORDERS_ALL_MEMBER_PATH =
  (process.env.REACT_APP_ORDERS_ALL_MEMBER_PATH && process.env.REACT_APP_ORDERS_ALL_MEMBER_PATH.trim()) ||
  "/orders/all-member";

/**
 * POST `{serverApi}/orders/cancel-by-member?orderId=...` — body `{ memberId, customerPhone }`.
 */
export const ORDERS_CANCEL_BY_MEMBER_PATH =
  (process.env.REACT_APP_ORDERS_CANCEL_BY_MEMBER_PATH &&
    process.env.REACT_APP_ORDERS_CANCEL_BY_MEMBER_PATH.trim()) ||
  "/orders/cancel-by-member";

export const RESTAURANT_NAME = "Zomin";

export const CURRENCY_SYMBOL = "₩"; // Won

export const Messages = {
  error1: "Somthing went wrong!",
  error2: "Please login first!",
  error3: "Please fulfill all inputs!",
  error4: "Message is empty!",
  error5: "Only images with jpeg, jpg, png format allowed!",
  error6: "Please QR scane first!",
};
