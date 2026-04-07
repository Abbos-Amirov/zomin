import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "../enums/order.enum";
import { Product } from "./product";

export interface OrderItem {
  _id: string;
  itemQuantity: number;
  itemPrice: number;
  orderId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  orderType: OrderType;
  orderStatus: OrderStatus;
  orderTotal: number;
  orderDelivery: number;
  tableId: string | null;
  memberId: string | null;
  orderNote: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  /** from aggregations */
  orderItems: OrderItem[];
  productData: Product[];
}

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: string;
  orderId?: string;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  type?: OrderType;
  status?: OrderStatus;
  payStatus?: PaymentStatus;
  payMeth?: PaymentMethod;
  search?: string;
  orderStatus?: OrderStatus;
}

/** Link / pre-order flow (POST body matches backend contract) */
export interface LinkOrderItemInput {
  productId: string;
  quantity: number;
}

export interface LinkOrderCreateInput {
  restaurantId: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  arrivalInMinutes: number;
  orderItems: LinkOrderItemInput[];
  /** Defaults to TABLE on backend if omitted */
  orderType?: OrderType;
}

/** Olib ketish — stol yo‘q (POST /order/link-takeout) */
export interface LinkTakeoutOrderCreateInput {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  arrivalInMinutes: number;
  orderItems: LinkOrderItemInput[];
  orderType?: OrderType;
}



