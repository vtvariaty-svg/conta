import { OrderDoc } from "@/lib/types";

export interface PixPaymentResult {
  reference: string;
  pixCode: string;
  pixQrCode: string;
  amount: number;
  expiresAt: string;
}

export interface PaymentProvider {
  createPixPayment(order: OrderDoc): Promise<PixPaymentResult>;
  getPaymentStatus(reference: string): Promise<string>;
  handleWebhook(payload: Record<string, unknown>): Promise<{ orderId: string; status: string }>;
  approveMockPayment(orderId: string): Promise<void>;
}
