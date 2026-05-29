import { OrderDoc, DeliveryDoc } from "@/lib/types";

export interface EmailProvider {
  sendOrderConfirmation(order: OrderDoc): Promise<void>;
  sendDeliveryEmail(order: OrderDoc, delivery: DeliveryDoc): Promise<void>;
  sendManualDeliveryNotice(order: OrderDoc): Promise<void>;
}
