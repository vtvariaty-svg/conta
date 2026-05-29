import { FieldValue, Firestore, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { emailProvider } from "@/lib/providers/email/mock";
import type { OrderDoc, ProductDoc, DeliveryDoc } from "@/lib/types";

export async function processDelivery(orderId: string): Promise<void> {
  const db = getAdminDb();
  const orderRef = db.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) throw new Error("Order not found");

  const order = { id: orderSnap.id, ...orderSnap.data() } as OrderDoc;

  // Idempotency: skip if already delivered
  if (order.deliveryStatus === "delivered") {
    console.log(`[Delivery] Order ${orderId} already delivered, skipping.`);
    return;
  }
  if (order.paymentStatus !== "paid") {
    throw new Error("Cannot deliver before payment approval");
  }

  const itemsSnap = await orderRef.collection("items").get();
  if (itemsSnap.empty) throw new Error("Order has no items");

  const item = itemsSnap.docs[0].data();
  const productSnap = await db.collection("products").doc(item.productId).get();
  if (!productSnap.exists) throw new Error("Product not found");

  const product = { id: productSnap.id, ...productSnap.data() } as ProductDoc;

  let deliveryContent = "";
  let deliveryStatus: "delivered" | "manual_required" = "delivered";

  switch (product.deliveryType) {
    case "fixed_link":
    case "file":
    case "single_code":
      deliveryContent = product.deliveryContent;
      break;

    case "code_list":
      deliveryContent = await reserveDigitalCode(
        db,
        product.id,
        orderId
      );
      if (!deliveryContent) {
        deliveryStatus = "manual_required";
      }
      break;

    case "manual":
      deliveryStatus = "manual_required";
      break;
  }

  const now = Timestamp.now();
  const deliveryRef = orderRef.collection("deliveries").doc();
  const delivery: Omit<DeliveryDoc, "id"> = {
    productId: product.id,
    deliveryType: product.deliveryType,
    deliveryContent,
    status: deliveryStatus,
    sentToEmail: order.customerEmail,
    deliveredAt: deliveryStatus === "delivered" ? now : null,
    resentAt: null,
    createdAt: now,
  };

  await deliveryRef.set(delivery);

  await orderRef.update({
    deliveryStatus,
    deliveredAt: deliveryStatus === "delivered" ? now : null,
    updatedAt: now,
  });

  const fullDelivery = { id: deliveryRef.id, ...delivery } as DeliveryDoc;

  if (deliveryStatus === "delivered") {
    await emailProvider.sendDeliveryEmail(order, fullDelivery);
  } else {
    await emailProvider.sendManualDeliveryNotice(order);
  }
}

async function reserveDigitalCode(
  db: Firestore,
  productId: string,
  orderId: string
): Promise<string> {
  const stockRef = db
    .collection("products")
    .doc(productId)
    .collection("digitalStock");

  let code = "";

  await db.runTransaction(async (tx) => {
    const availableSnap = await tx.get(
      stockRef.where("status", "==", "available").limit(1)
    );
    if (availableSnap.empty) {
      return;
    }

    const codeDoc = availableSnap.docs[0];
    code = codeDoc.data().code as string;

    tx.update(codeDoc.ref, {
      status: "delivered",
      orderId,
      deliveredAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Decrement product stock
    tx.update(db.collection("products").doc(productId), {
      stock: FieldValue.increment(-1),
      updatedAt: Timestamp.now(),
    });
  });

  return code;
}
