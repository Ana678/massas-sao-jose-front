import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Pen } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ProductGrid from "@/components/ProductGrid";
import PaymentSelector from "@/components/PaymentSelector";
import Checkbox from "@/components/form/Checkbox";
import FormSubmitButton from "@/components/form/FormSubmitButton";
import SectionLabel from "@/components/form/SectionLabel";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useOrderByID, useUpdateOrder } from "@/lib/hooks/useOrders";
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
    const { data: order, isLoading: loadingOrder } = useOrderByID(id);
    const { mutateAsync: updateOrder, isPending: isSaving } = useUpdateOrder();

    const [payment, setPayment] = useState<PaymentMethod>(
        (order?.paymentMethod as PaymentMethod) || "dinheiro"
    );
    const [paymentConfirmed, setPaymentConfirmed] = useState(Boolean(order?.isPaid));
    const [cart, setCart] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {};
        order?.products.forEach((product) => { initial[product.id] = Number(product.quantity); });
        return initial;
    });

    const productsList: EditableLineItem[] = useMemo(() => Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => {
            const product = products.find((p) => p.id === productId);
            const orderProduct = order?.products.find((p) => p.id === productId);
            return {
                productId,
                productName: product?.name || orderProduct?.name || "Produto",
                qty,
                unitPrice: product?.price ?? orderProduct?.price ?? 0,
            };
        }), [cart, products, order?.products]);
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
        if (!order || productsList.length === 0) return;
        try {
            await updateOrder({
                id: order.id,
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

    if (loadingProducts || loadingOrder) {
        return <div className="p-6 text-center text-muted-foreground mt-20">Carregando pedido...</div>;
    }

    if (!order) {
        return <PageHeader title="Pedido não encontrado" backTo="/orders" />;
    }

    return (
        <div className="flex flex-col min-h-screen pb-36">
            <PageHeader title="Editar Pedido" subtitle={order.clientName} backTo="/orders" />

            <section className="px-4 pb-3">
                <div className="bg-card rounded-2xl border border-border p-4">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Total atualizado</p>
                    <p className="text-primary text-4xl tracking-tighter font-normal">{formatCurrency(total)}</p>
                    <div className="flex items-center justify-between border-t border-border mt-4 pt-3 text-xs text-muted-foreground">
                        <span>{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
                        <span>{new Date(order.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                </div>
            </section>

            <section className="px-4 pb-3">
                <ProductGrid products={products} quantities={cart} onTap={tapProduct} onAdjust={adjustQty} onSetQty={setQty} />
            </section>

            <section className="px-4 pb-3 space-y-3">
                <SectionLabel className="mt-4">Forma de Pagamento</SectionLabel>
                <PaymentSelector value={payment} onChange={setPayment} />

                <Checkbox
                    checked={paymentConfirmed}
                    onChange={setPaymentConfirmed}
                    label="Pagamento recebido"
                />
            </section>

            <div className="fixed bottom-0 w-full max-w-md z-60">
                <div className="bg-card px-4 py-6 border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <FormSubmitButton
                        onClick={save}
                        disabled={productsList.length === 0 || isSaving}
                        loading={isSaving}
                        icon={Pen}
                        fullWidth
                    >
                        Confirmar Edição
                    </FormSubmitButton>
                </div>
            </div>
        </div>
    );
}
