/**
 * Seed script: creates admin user, categories, and demo products.
 * Run: npm run seed
 *
 * Requires a .env.local with FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
 * FIREBASE_PRIVATE_KEY, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 */

import * as admin from "firebase-admin";

// Load env
const dotenv = await import("dotenv");
dotenv.config({ path: ".env.local" });

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

const now = admin.firestore.Timestamp.now();

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL ?? "admin@demo.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123456";
  const name = process.env.ADMIN_NAME ?? "Admin";

  let uid: string;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log(`[Seed] Admin user already exists: ${email}`);
  } catch {
    const user = await auth.createUser({ email, password, displayName: name });
    uid = user.uid;
    console.log(`[Seed] Created admin user: ${email}`);
  }

  await db.collection("users").doc(uid).set({
    id: uid,
    name,
    email,
    role: "admin",
    status: "active",
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  console.log(`[Seed] Admin user record saved.`);
  return uid;
}

async function createCategories() {
  const categories = [
    { name: "Gamer", slug: "gamer", description: "Produtos para gamers" },
    { name: "Creator", slug: "creator", description: "Para criadores de conteúdo" },
    { name: "Produtividade", slug: "produtividade", description: "Ferramentas de produtividade" },
    { name: "Acesso Digital", slug: "acesso-digital", description: "Acessos e licenças digitais" },
  ];

  const ids: Record<string, string> = {};

  for (const cat of categories) {
    const snap = await db.collection("categories").where("slug", "==", cat.slug).limit(1).get();
    if (!snap.empty) {
      ids[cat.slug] = snap.docs[0].id;
      console.log(`[Seed] Category exists: ${cat.name}`);
      continue;
    }
    const ref = db.collection("categories").doc();
    await ref.set({ ...cat, status: "active", createdAt: now, updatedAt: now });
    ids[cat.slug] = ref.id;
    console.log(`[Seed] Created category: ${cat.name}`);
  }

  return ids;
}

async function createProducts(categoryIds: Record<string, string>) {
  const products = [
    {
      categoryId: categoryIds["gamer"],
      categoryName: "Gamer",
      name: "Combo Gamer Inicial",
      slug: "combo-gamer-inicial",
      shortDescription: "Acesso a ferramentas essenciais para gaming",
      fullDescription: "Pack com 3 acessos premium para plataformas de gaming. Ideal para quem está começando.",
      imageUrl: "",
      price: 29.90,
      cost: 10.00,
      deliveryType: "code_list" as const,
      deliveryContent: "",
      riskLevel: "yellow" as const,
      status: "active" as const,
      stock: 3,
      instructions: "Use os códigos na plataforma indicada. Válido por 30 dias.",
      replacementPolicy: "Reposição garantida por 7 dias se o código não funcionar.",
      codes: ["GAME-DEMO-001", "GAME-DEMO-002", "GAME-DEMO-003"],
    },
    {
      categoryId: categoryIds["creator"],
      categoryName: "Creator",
      name: "Pack Creator Pro",
      slug: "pack-creator-pro",
      shortDescription: "Templates e recursos para criadores de conteúdo",
      fullDescription: "Pacote completo com recursos premium para elevar seu conteúdo ao próximo nível.",
      imageUrl: "",
      price: 49.90,
      cost: 5.00,
      deliveryType: "fixed_link" as const,
      deliveryContent: "https://drive.google.com/demo-pack-creator-pro",
      riskLevel: "green" as const,
      status: "active" as const,
      stock: 999,
      instructions: "Acesse o link e faça o download dos arquivos.",
      replacementPolicy: "Garantia de 7 dias para links com problema.",
    },
    {
      categoryId: categoryIds["acesso-digital"],
      categoryName: "Acesso Digital",
      name: "Produto Manual Assistido",
      slug: "produto-manual-assistido",
      shortDescription: "Acesso premium com suporte dedicado",
      fullDescription: "Produto que requer configuração manual personalizada pela nossa equipe.",
      imageUrl: "",
      price: 99.90,
      cost: 20.00,
      deliveryType: "manual" as const,
      deliveryContent: "",
      riskLevel: "red" as const,
      status: "paused" as const,
      stock: 0,
      instructions: "Após o pagamento, nossa equipe entrará em contato em até 24h.",
      replacementPolicy: "Suporte incluído por 30 dias.",
    },
  ];

  for (const product of products) {
    const { codes, ...productData } = product as any;
    const snap = await db.collection("products").where("slug", "==", product.slug).limit(1).get();

    let productId: string;
    if (!snap.empty) {
      productId = snap.docs[0].id;
      console.log(`[Seed] Product exists: ${product.name}`);
    } else {
      const ref = db.collection("products").doc();
      await ref.set({ ...productData, createdAt: now, updatedAt: now });
      productId = ref.id;
      console.log(`[Seed] Created product: ${product.name}`);
    }

    // Add digital codes for code_list products
    if (codes && Array.isArray(codes)) {
      const stockRef = db.collection("products").doc(productId).collection("digitalStock");
      const existingSnap = await stockRef.limit(1).get();
      if (existingSnap.empty) {
        const batch = db.batch();
        for (const code of codes) {
          const codeRef = stockRef.doc();
          batch.set(codeRef, {
            code,
            status: "available",
            orderId: null,
            deliveredAt: null,
            createdAt: now,
            updatedAt: now,
          });
        }
        await batch.commit();
        console.log(`[Seed] Added ${codes.length} codes for ${product.name}`);
      }
    }
  }
}

async function createSettings() {
  const snap = await db.collection("settings").doc("main").get();
  if (snap.exists) {
    console.log("[Seed] Settings already exist.");
    return;
  }
  await db.collection("settings").doc("main").set({
    storeName: "Loja Digital",
    supportEmail: "suporte@lojadigital.com",
    supportWhatsapp: "+55 11 99999-9999",
    refundPolicy: "Política de reembolso: produtos digitais não possuem direito a reembolso após a entrega, salvo comprovação de produto defeituoso.",
    terms: "Termos de Uso: ao realizar uma compra em nossa plataforma, você concorda com os termos de uso.",
    maintenanceMode: false,
    createdAt: now,
    updatedAt: now,
  });
  console.log("[Seed] Settings created.");
}

async function main() {
  console.log("[Seed] Starting...");
  await createAdminUser();
  const categoryIds = await createCategories();
  await createProducts(categoryIds);
  await createSettings();
  console.log("[Seed] Done! 🎉");
  process.exit(0);
}

main().catch((err) => {
  console.error("[Seed] Error:", err);
  process.exit(1);
});
