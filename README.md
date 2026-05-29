# Loja Digital — Plataforma de Venda de Produtos Digitais

MVP completo para venda de produtos digitais com painel administrativo, checkout Pix mock, entrega automática e relatórios.

## Stack

- **Frontend/Backend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Autenticação:** Firebase Authentication (email/senha)
- **Banco de dados:** Cloud Firestore
- **Armazenamento:** Cloud Storage for Firebase
- **Server-side:** Firebase Admin SDK (route handlers seguros)
- **Deploy:** Firebase App Hosting (recomendado)

---

## Configuração Inicial

### 1. Clonar e instalar dependências

```bash
git clone <seu-repositorio>
cd loja-digital
npm install
```

### 2. Criar projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative **Authentication** → método Email/Senha
4. Ative **Firestore** (modo produção)
5. Ative **Storage**
6. Crie um app Web para obter as credenciais NEXT_PUBLIC_*
7. Gere uma Service Account: Configurações → Contas de serviço → Gerar nova chave privada

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local`:
- `NEXT_PUBLIC_FIREBASE_*` → do console Firebase (Configurações → App Web)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` → da chave JSON da Service Account

### 4. Aplicar regras de segurança

```bash
npm install -g firebase-tools
firebase login
cp .firebaserc.example .firebaserc
# Edite .firebaserc com seu project ID

firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

---

## Rodando Localmente

```bash
npm run dev
# Acesse http://localhost:3000
# Painel admin: http://localhost:3000/admin
```

### Com Firebase Emulators (opcional)

```bash
# Terminal 1
npm run firebase:emulators

# Terminal 2
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 npm run dev
```

---

## Seed — Dados Iniciais

```bash
npm run seed
```

Cria:
- Usuário admin: `admin@demo.com` / `admin123456`
- 4 categorias: Gamer, Creator, Produtividade, Acesso Digital
- 3 produtos demonstrativos (code_list, fixed_link, manual)
- Configurações da loja

---

## Login Admin de Desenvolvimento

- URL: `/admin/login`
- Email: `admin@demo.com`
- Senha: `admin123456`

---

## Testando o Fluxo Completo

### Cadastrar produto
1. Login em `/admin/login`
2. Produtos → Novo Produto
3. Status **Ativo**, preencha todos os campos
4. Para `code_list`: adicione códigos no campo correspondente

### Simular uma compra
1. Acesse `/` ou `/products`
2. Clique em um produto ativo → Comprar Agora
3. Preencha nome, email e WhatsApp
4. Na tela de pagamento, clique em **"Simular Pagamento Aprovado"**
5. Você será redirecionado para a confirmação com o produto entregue

### Produto code_list
- Crie produto com deliveryType `code_list` e adicione códigos
- Ao comprar, um código único é reservado via transação Firestore
- O mesmo código nunca é entregue duas vezes

### Painel Admin
- **Pedidos**: veja todos, filtre, clique para ver detalhes, aprove pagamentos mock, reenvie entregas, resolva manuais, adicione notas
- **Relatórios**: faturamento, custo, lucro, ranking de produtos
- **Configurações**: nome da loja, suporte, políticas

---

## Estrutura do Projeto

```
app/
  admin/          # Painel administrativo
  api/            # Route handlers (server-side seguro)
  checkout/       # Fluxo de compra
  payment/        # Aguardo de pagamento Pix
  order/          # Confirmação e entrega
  products/       # Loja pública
  categories/     # Páginas de categoria
  faq/ terms/ refund-policy/ support/
components/
  admin/          # Sidebar, tabelas
  store/          # Header, Footer, ProductCard
  ui/             # Button, Badge, Input, Card, Spinner
contexts/
  AuthContext.tsx # Firebase Auth
lib/
  firebase/       # client.ts, admin.ts
  providers/      # MockPaymentProvider, MockEmailProvider
  services/       # auth.ts, delivery.ts
  types/          # Todos os tipos TypeScript
  utils/          # format.ts, slug.ts, cn.ts
scripts/
  seed.ts         # Seed de dados iniciais
```

---

## Coleções Firestore

| Coleção | Descrição |
|---------|-----------|
| `users` | Usuários administrativos |
| `categories` | Categorias |
| `products` | Produtos |
| `products/{id}/faqs` | FAQs por produto |
| `products/{id}/digitalStock` | Códigos do estoque digital |
| `orders` | Pedidos |
| `orders/{id}/items` | Itens do pedido |
| `orders/{id}/deliveries` | Registros de entrega |
| `orders/{id}/notes` | Notas internas |
| `paymentEvents` | Log de eventos de pagamento |
| `settings` | Configurações da loja |

---

## Deploy — Firebase App Hosting

Opção recomendada para Next.js full-stack (SSR + API routes):

```bash
firebase apphosting:backends:create
# Siga as instruções e conecte ao repositório GitHub
firebase deploy
```

Documentação: https://firebase.google.com/docs/app-hosting

---

## Adicionando Gateway Pix Real

A arquitetura já está preparada via interface `PaymentProvider`:

1. Crie `lib/providers/payment/mercadopago.ts` implementando `PaymentProvider`
2. Substitua `mockPaymentProvider` em `app/api/checkout/route.ts`
3. Configure o webhook em `app/api/payments/webhook/route.ts`

---

## Próximas Etapas (Pós-MVP)

- [ ] Gateway Pix real (Mercado Pago, Efí, PagHiper)
- [ ] Webhook de pagamento
- [ ] Upload real para Cloud Storage
- [ ] Email transacional (Resend, SendGrid)
- [ ] Paginação nas listagens
- [ ] Exportação CSV de relatórios
- [ ] Notificações WhatsApp/Telegram
- [ ] 2FA para admin

## Pendências Técnicas — V1

- Gateway Pix é mock (simulado); não cobrar clientes reais sem integrar gateway real
- Upload de arquivos usa URLs externas (não Cloud Storage)
- Email é apenas log no console (não enviado)
