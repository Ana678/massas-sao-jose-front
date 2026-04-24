import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Check, CircleDollarSign, Pen } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ProductGrid from "@/components/ProductGrid";
import PaymentSelector from "@/components/PaymentSelector";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useOrdersList, useUpdateOrder } from "@/lib/hooks/useOrders";
import { useProducts } from "@/lib/hooks/useProduct";

type PaymentMethod = "dinheiro" | "pix" | "cartao";

interface EditableLineItem {
    productId: string;
    productName: string;
    qty: number;
    unitPrice: number;
}

export default function EditOrderPage() {

    const { id } = useSearch({ from: "/_authenticated/order/edit" });
    const navigate = useNavigate();
    const { data: products = [], isLoading: loadingProducts } = useProducts();
    const { data: orders = [], isLoading: loadingOrders } = useOrdersList();
    const { mutateAsync: updateOrder, isPending: isSaving } = useUpdateOrder();
    const original = orders.find((order) => order.id === id);

    const [payment, setPayment] = useState<PaymentMethod>(
        (original?.paymentMethod as PaymentMethod) || "dinheiro"
    );
    const [paymentConfirmed, setPaymentConfirmed] = useState(Boolean(original?.isPaid));
    const [cart, setCart] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        original?.products.forEach((product) => { initial[product.id] = product.quantity; });
        return initial;
    });

    const productsList: EditableLineItem[] = useMemo(() => Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => {
            const product = products.find((p) => p.id === productId);
            const originalProduct = original?.products.find((p) => p.id === productId);
            return {
                productId,
                productName: product?.name || originalProduct?.name || "Produto",
                qty,
                unitPrice: product?.price ?? originalProduct?.price ?? 0,
            };
        }), [cart, products, original?.products]);
    const total = productsList.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const totalItems = productsList.reduce((sum, item) => sum + item.qty, 0);

    function tapProduct(productId: string) {
        setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    }

    function adjustQty(productId: string, delta: number) {
        setCart((prev) => {
            const qty = Math.max(0, (prev[productId] || 0) + delta);
            const next = { ...prev };
            if (qty === 0) delete next[productId];
            else next[productId] = qty;
            return next;
        });
    }

    function setQty(productId: string, qty: number) {
        setCart((prev) => {
            const next = { ...prev };
            if (qty <= 0) delete next[productId];
            else next[productId] = qty;
            return next;
        });
    }

    async function save() {
        if (!original || productsList.length === 0) return;
        console.log("payment", payment, "isPaid", paymentConfirmed, "products", productsList);
        try {
            await updateOrder({
                id: original.id,
                paymentMethod: payment,
                isPaid: paymentConfirmed,
                products: productsList.map((item) => ({
                    productId: item.productId,
                    quantity: item.qty,
                })),
            });
            toast.success("Pedido atualizado");
            navigate({ to: '/orders' });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar pedido");
        }
    }

    if (loadingProducts || loadingOrders) {
        return <div className="p-6 text-center text-muted-foreground mt-20">Carregando pedido...</div>;
    }

    if (!original) {
        return <PageHeader title="Pedido não encontrado" backTo="/orders" />;
    }

    return (
        <div className="flex flex-col min-h-screen pb-36">
            <PageHeader title="Editar Pedido" subtitle={original.clientName} backTo="/orders" />

            <section className="px-4 pb-3">
                <div className="bg-card rounded-2xl border border-border p-4">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Total atualizado</p>
                    <p className="text-primary text-4xl tracking-tighter font-normal">{formatCurrency(total)}</p>
                    <div className="flex items-center justify-between border-t border-border mt-4 pt-3 text-xs text-muted-foreground">
                        <span>{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
                        <span>{new Date(original.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                </div>
            </section>

            <section className="px-4 pb-3">
                <ProductGrid products={products} quantities={cart} onTap={tapProduct} onAdjust={adjustQty} onSetQty={setQty} />
            </section>

            <section className="px-4 pb-3 space-y-3">
                <PaymentSelector value={payment} onChange={setPayment} />
                <button
                    onClick={() => setPaymentConfirmed((value) => !value)}
                    className={`w-full rounded-xl p-4 flex items-center justify-between border transition-colors ${paymentConfirmed ? "bg-primary/10 border-primary/30 text-primary" : "bg-card border-border text-foreground"}`}
                >
                    <span className="flex items-center gap-2 text-sm"><CircleDollarSign className="w-5 h-5" />Pagamento recebido</span>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentConfirmed ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                        {paymentConfirmed && <Check className="w-3 h-3 text-primary-foreground" />}
                    </span>
                </button>
            </section>

            <div className="fixed bottom-0 w-full max-w-md z-60">
                <div className="bg-card px-4 py-6 border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={save}
                        disabled={productsList.length === 0 || isSaving}
                        className="w-full bg-primary text-primary-foreground rounded-xl p-3.5 flex items-center justify-center gap-2 font-normal disabled:opacity-40 shadow-lg"
                    >
                        <Pen className="w-4 h-4" />
                        {isSaving ? "Salvando..." : "Confirmar Edição"}
                    </button>
                </div>
            </div>
        </div>
    );
}
