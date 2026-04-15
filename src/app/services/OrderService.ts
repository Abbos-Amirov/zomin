import axios from "axios";
import {
  ORDERS_ALL_MEMBER_PATH,
  ORDERS_CANCEL_BY_MEMBER_PATH,
  serverApi,
} from "../../lib/config";
import { CartItem } from "../../lib/types/search";
import { OrderStatus } from "../../lib/enums/order.enum";
import {
  LinkOrderCreateInput,
  LinkTakeoutOrderCreateInput,
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../../lib/types/order";

/** Backend Mongo/paginate: `docs`, Postman: `orderList` va hokazo */
const ORDER_LIST_ROOT_KEYS = [
  "orders",
  "orderList",
  "ordersList",
  "list",
  "data",
  "items",
  "result",
  "records",
  "rows",
  "payload",
  "docs",
  "content",
  "value",
  "body",
];

function isOrderLikeRow(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const o = item as Record<string, unknown>;
  if (typeof o._id !== "string") return false;
  return (
    o.orderStatus != null ||
    Array.isArray(o.orderItems) ||
    typeof o.orderTotal === "number" ||
    o.memberId != null ||
    o.tableId != null ||
    o.customerName != null
  );
}

function findFirstOrderArrayDeep(data: unknown, depth: number): Order[] {
  if (depth > 16) return [];
  if (Array.isArray(data)) {
    const orders = data.filter(isOrderLikeRow) as Order[];
    if (orders.length > 0) return orders;
    for (const el of data) {
      const inner = findFirstOrderArrayDeep(el, depth + 1);
      if (inner.length > 0) return inner;
    }
    return [];
  }
  if (data && typeof data === "object") {
    for (const v of Object.values(data as Record<string, unknown>)) {
      const inner = findFirstOrderArrayDeep(v, depth + 1);
      if (inner.length > 0) return inner;
    }
  }
  return [];
}

/** GET /order/all, GET /orders/all-member — massiv yoki keng tarqalgan wrapperlar */
function extractOrderListFromResponse(data: unknown): Order[] {
  if (Array.isArray(data)) {
    if (data.length === 0) return [];
    if (isOrderLikeRow(data[0])) return data as Order[];
    const deep = findFirstOrderArrayDeep(data, 0);
    if (deep.length > 0) return deep;
    if (
      data.every(
        (x) =>
          x &&
          typeof x === "object" &&
          typeof (x as Record<string, unknown>)._id === "string"
      )
    ) {
      return data as Order[];
    }
    return [];
  }
  if (!data || typeof data !== "object") {
    return [];
  }
  const root = data as Record<string, unknown>;
  for (const k of ORDER_LIST_ROOT_KEYS) {
    const v = root[k];
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      if (isOrderLikeRow(v[0])) return v as Order[];
      const inner = extractOrderListFromResponse(v);
      if (inner.length > 0) return inner;
    }
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = extractOrderListFromResponse(v);
      if (inner.length > 0) return inner;
    }
  }
  return findFirstOrderArrayDeep(data, 0);
}

/** GET /orders/all-member javobidan bitta a'zoning barcha buyurtmalari */
function partitionOrdersByMemberList(all: Order[]): {
  paused: Order[];
  pending: Order[];
  process: Order[];
  finished: Order[];
} {
  const paused: Order[] = [];
  const pending: Order[] = [];
  const process: Order[] = [];
  const finished: Order[] = [];
  for (const o of all) {
    const raw = o.orderStatus;
    const s =
      typeof raw === "string" ? (raw.trim().toUpperCase() as OrderStatus) : raw;
    if (s === OrderStatus.PAUSE) paused.push(o);
    else if (s === OrderStatus.PENDING) pending.push(o);
    else if (s === OrderStatus.PROCESS) process.push(o);
    else if (s === OrderStatus.COMPLETED || s === OrderStatus.SERVED) finished.push(o);
    else if (s === OrderStatus.CANCELLED) finished.push(o);
    else process.push(o);
  }
  return { paused, pending, process, finished };
}

class OrderService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  /**
   * POST /order/link — withCredentials: cookie (accessToken).
   * Login qilgan a’zo: memberId/cookie. Login bo‘lmagan havola mijozi: backend `customerPhone`
   * ni boshqa faol buyurtmalar bilan solishtiradi (viewer null).
   */
  public async createLinkOrder(input: LinkOrderCreateInput): Promise<Order> {
    try {
      const url = this.path + "/order/link";
      const result = await axios.post(url, input, { withCredentials: true });
      console.log("createLinkOrder:", result);
      return result.data;
    } catch (err) {
      console.log("Error. createLinkOrder: ", err);
      throw err;
    }
  }

  /** POST /order/link-takeout — withCredentials xuddi /order/link kabi */
  public async createLinkTakeoutOrder(input: LinkTakeoutOrderCreateInput): Promise<Order> {
    try {
      const url = this.path + "/order/link-takeout";
      const result = await axios.post(url, input, { withCredentials: true });
      console.log("createLinkTakeoutOrder:", result);
      return result.data;
    } catch (err) {
      console.log("Error. createLinkTakeoutOrder: ", err);
      throw err;
    }
  }

  public async createOrder(
    input: CartItem[],
    options?: { memberId?: string; tableId?: string }
  ): Promise<Order> {
    try {
      const orderItems: OrderItemInput[] = input.map((cartItem: CartItem) => {
        return {
          itemQuantity: cartItem.quantity,
          itemPrice: cartItem.price,
          productId: cartItem._id,
        };
      });

      const body: Record<string, unknown> = { orderItems };
      if (options?.memberId) body.memberId = options.memberId;
      if (options?.tableId) body.tableId = options.tableId;

      const url = this.path + "/order/create";
      const result = await axios.post(url, body, {
        withCredentials: true,
      });
      console.log("createOrder:", result);
      return result.data;
    } catch (err) {
      console.log("Error. createOrder: ", err);
      throw err;
    }
  }

  /**
   * GET `{serverApi}{ORDERS_ALL_MEMBER_PATH}` — bitta a'zoning barcha buyurtmalari.
   */
  public async getOrdersByMemberId(
    memberId: string,
    options?: { page?: number; limit?: number }
  ): Promise<Order[]> {
    try {
      const page = options?.page ?? 1;
      const limit = options?.limit ?? 200;
      const url = `${this.path}${ORDERS_ALL_MEMBER_PATH}?memberId=${encodeURIComponent(
        memberId
      )}&page=${page}&limit=${limit}`;
      const result = await axios.get(url, { withCredentials: true });
      const list = extractOrderListFromResponse(result.data);
      if (list.length === 0 && result.data != null && typeof result.data === "object") {
        console.warn(
          `[OrderService] GET ${ORDERS_ALL_MEMBER_PATH}: bo'sh yoki notanish javob. kalitlar:`,
          Object.keys(result.data as object)
        );
      }
      return list;
    } catch (err) {
      console.log("Error. getOrdersByMemberId: ", err);
      throw err;
    }
  }

  /** Havola /orders-link: bitta so'rov, keyin status bo'yicha bo'linadi */
  public async getMemberOrdersPartitioned(memberId: string): Promise<{
    paused: Order[];
    pending: Order[];
    process: Order[];
    finished: Order[];
  }> {
    const all = await this.getOrdersByMemberId(memberId, { page: 1, limit: 500 });
    return partitionOrdersByMemberList(all);
  }

  public async getMyOrders(input: OrderInquiry): Promise<Order[]> {
    try {
      const url = `${this.path}/order/all`;
      const query = `?page=${input.page}&limit=${input.limit}&orderStatus=${input.orderStatus}`;

      const result = await axios.get(url + query, { withCredentials: true });
      console.log("getMyOrders: ", result);

      const list = extractOrderListFromResponse(result.data);
      if (list.length === 0 && result.data != null && typeof result.data === "object") {
        console.warn(
          "[OrderService] GET /order/all: topilmadi yoki bo'sh. response kalitlari:",
          Object.keys(result.data as object)
        );
      }
      return list;
    } catch (err) {
      console.log("Error. getMyOrders: ", err);
      throw err;
    }
  }

  public async updateOrder(input: OrderUpdateInput): Promise<Order> {
    try {
      const url = `${this.path}/order/update`;
      const result = await axios.post(url, input, { withCredentials: true });
      console.log("updateOrder:", result);
      return result.data;
    } catch (err) {
      console.log("Error. updateOrder: ", err);
      throw err;
    }
  }

  /**
   * Havola `/orders-link` bekor qilish — POST body `{ memberId, customerPhone }` (query: `orderId`).
   */
  public async cancelOrderByMember(
    memberId: string,
    orderId: string,
    customerPhone: string
  ): Promise<unknown> {
    try {
      const url = `${this.path}${ORDERS_CANCEL_BY_MEMBER_PATH}?orderId=${encodeURIComponent(
        orderId
      )}`;
      const result = await axios.post(
        url,
        { memberId, customerPhone },
        { withCredentials: true }
      );
      console.log("cancelOrderByMember:", result);
      return result.data;
    } catch (err) {
      console.log("Error. cancelOrderByMember: ", err);
      throw err;
    }
  }

  /**
   * PATCH `/order/:orderId/item/:orderItemId/quantity` — body `{ quantity }`
   */
  public async updateOrderItemQuantity(
    orderId: string,
    orderItemId: string,
    quantity: number
  ): Promise<unknown> {
    try {
      const url = `${this.path}/order/${encodeURIComponent(
        orderId
      )}/item/${encodeURIComponent(orderItemId)}/quantity`;
      const result = await axios.patch(
        url,
        { quantity },
        { withCredentials: true }
      );
      console.log("updateOrderItemQuantity:", result);
      return result.data;
    } catch (err) {
      console.log("Error. updateOrderItemQuantity: ", err);
      throw err;
    }
  }
}

export default OrderService;
