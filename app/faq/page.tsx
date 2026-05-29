import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Como recebo meu produto após a compra?", a: "Após a confirmação do pagamento via Pix, seu produto é entregue automaticamente. Você verá o conteúdo diretamente na tela de confirmação do pedido." },
  { q: "Quanto tempo leva para o pagamento ser confirmado?", a: "Pagamentos via Pix são confirmados em segundos. Assim que identificarmos o pagamento, a entrega é processada automaticamente." },
  { q: "E se eu tiver um problema com o produto?", a: "Entre em contato com nosso suporte. Temos política de reposição para produtos com problemas." },
  { q: "Os produtos são legais?", a: "Sim, todos os produtos vendidos em nossa plataforma são legítimos e dentro da legalidade." },
  { q: "Posso pedir reembolso?", a: "Consulte nossa política de reembolso para mais detalhes sobre as condições de devolução." },
];

export default function FAQPage() {
  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">FAQ</h1>
          <p className="text-gray-500 mb-10">Perguntas frequentes sobre nossa loja</p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-gray-900/80 border border-gray-800 rounded-2xl">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
