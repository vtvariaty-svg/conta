// ─── Enums ───────────────────────────────────────────────────────────────────

// Use a generic timestamp interface compatible with both firebase and firebase-admin
export interface TimestampLike {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

export type ProductStatus = "draft" | "active" | "paused" | "archived";
export type DeliveryType =
  | "fixed_link"
  | "file"
  | "single_code"
  | "code_list"
  | "manual";
export type RiskLevel = "green" | "yellow" | "red";
export type StockStatus = "available" | "reserved" | "delivered" | "blocked";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded"
  | "canceled";
export type DeliveryStatus =
  | "pending"
  | "delivered"
  | "failed"
  | "manual_required"
  | "resent";
export type UserRole = "admin" | "operator";
export type CategoryStatus = "active" | "inactive";
export type UserStatus = "active" | "inactive";

// ─── Firestore Models ─────────────────────────────────────────────────────────

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface ProductDoc {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  price: number;
  cost: number;
  deliveryType: DeliveryType;
  deliveryContent: string;
  riskLevel: RiskLevel;
  status: ProductStatus;
  stock: number;
  instructions: string;
  replacementPolicy: string;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface FaqDoc {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface DigitalStockDoc {
  id: string;
  code: string;
  status: StockStatus;
  orderId: string | null;
  deliveredAt: TimestampLike | null;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface OrderDoc {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentFee: number;
  productCost: number;
  estimatedProfit: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  gatewayReference: string;
  createdAt: TimestampLike;
  paidAt: TimestampLike | null;
  deliveredAt: TimestampLike | null;
  updatedAt: TimestampLike;
}

export interface OrderItemDoc {
  id: string;
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  totalCost: number;
  createdAt: TimestampLike;
}

export interface DeliveryDoc {
  id: string;
  productId: string;
  deliveryType: DeliveryType;
  deliveryContent: string;
  status: DeliveryStatus;
  sentToEmail: string;
  deliveredAt: TimestampLike | null;
  resentAt: TimestampLike | null;
  createdAt: TimestampLike;
}

export interface NoteDoc {
  id: string;
  userId: string;
  userName: string;
  note: string;
  createdAt: TimestampLike;
}

export interface PaymentEventDoc {
  id: string;
  orderId: string;
  gateway: string;
  eventType: string;
  payload: Record<string, unknown>;
  processed: boolean;
  createdAt: TimestampLike;
}

export interface SettingsDoc {
  storeName: string;
  supportWhatsapp: string;
  supportEmail: string;
  refundPolicy: string;
  terms: string;
  maintenanceMode: boolean;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface CreateProductInput {
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  price: number;
  cost: number;
  deliveryType: DeliveryType;
  deliveryContent: string;
  riskLevel: RiskLevel;
  status: ProductStatus;
  stock: number;
  instructions: string;
  replacementPolicy: string;
}

export interface CreateOrderInput {
  productId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  pixCode: string;
  pixQrCode: string;
  amount: number;
  expiresAt: string;
}

export interface ReportData {
  grossRevenue: number;
  paidOrders: number;
  pendingOrders: number;
  canceledOrders: number;
  totalCost: number;
  estimatedProfit: number;
  estimatedMargin: number;
  topProductsByRevenue: ProductRanking[];
  topProductsByProfit: ProductRanking[];
  lowStockProducts: ProductDoc[];
  pausedProducts: number;
  manualDeliveryPending: number;
}

export interface ProductRanking {
  productId: string;
  productName: string;
  revenue: number;
  profit: number;
  soldCount: number;
}
