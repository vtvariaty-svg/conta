import { OrderDoc, DeliveryDoc } from "@/lib/types";
import { EmailProvider } from "./types";

export class MockEmailProvider implements EmailProvider {
  async sendOrderConfirmation(order: OrderDoc): Promise<void> {
    console.log(`[Email] Order confirmation sent to ${order.customerEmail} for order ${order.orderNumber}`);
  }

  async sendDeliveryEmail(order: OrderDoc, delivery: DeliveryDoc): Promise<void> {
    console.log(`[Email] Delivery email sent to ${order.customerEmail}`, {
      orderId: order.id,
      deliveryType: delivery.deliveryType,
    });
  }

  async sendManualDeliveryNotice(order: OrderDoc): Promise<void> {
    console.log(`[Email] Manual delivery notice for order ${order.orderNumber} to ${order.customerEmail}`);
  }
}

export const emailProvider = new MockEmailProvider();
