import { OrderDoc } from "@/lib/types";
import { PixPaymentResult, PaymentProvider } from "./types";

export class MockPaymentProvider implements PaymentProvider {
  async createPixPayment(order: OrderDoc): Promise<PixPaymentResult> {
    const reference = `MOCK-${order.id}-${Date.now()}`;
    const pixCode = `00020126580014br.gov.bcb.pix0136${reference}5204000053039865802BR5925LOJA DIGITAL DEMO6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    return {
      reference,
      pixCode,
      pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`,
      amount: order.totalAmount,
      expiresAt,
    };
  }

  async getPaymentStatus(reference: string): Promise<string> {
    console.log("[MockPayment] getPaymentStatus called for", reference);
    return "pending";
  }

  async handleWebhook(
    payload: Record<string, unknown>
  ): Promise<{ orderId: string; status: string }> {
    const orderId = payload.orderId as string;
    return { orderId, status: "paid" };
  }

  // Only exists in mock — not part of real gateways
  async approveMockPayment(orderId: string): Promise<void> {
    console.log("[MockPayment] Approving mock payment for order", orderId);
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
