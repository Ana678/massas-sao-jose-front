import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FileDown, MessageCircle, Pen, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PaymentSelector from "@/components/PaymentSelector";
import StatusSelector from "@/components/StatusSelector";
import Checkbox from "@/components/form/Checkbox";
import FormSubmitButton from "@/components/form/FormSubmitButton";
import SectionLabel from "@/components/form/SectionLabel";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
	useOrderByID,
	useUpdateOrder,
	useDeleteOrder,
} from "@/lib/hooks/useOrders";
import { useProducts } from "@/lib/hooks/useProduct";
import { exportOrderPDF, shareOrderWhatsApp } from "@/lib/make-pdf";
import LineItemsList from "@/components/LineItemsList";

type PaymentMethod = "dinheiro" | "pix" | "cartao";

export default function EditOrderPage() {
	const { id } = useSearch({ from: "/_authenticated/order/edit" });
	const navigate = useNavigate();
	const { data: products = [], isLoading: loadingProducts } = useProducts();
	const { data: order, isLoading: loadingOrder } = useOrderByID(id);
	const { mutateAsync: updateOrder, isPending: isSaving } = useUpdateOrder();
	const { mutateAsync: deleteOrder, isPending: isDeleting } = useDeleteOrder();

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const [payment, setPayment] = useState<PaymentMethod>("dinheiro");
	const [paymentConfirmed, setPaymentConfirmed] = useState(false);
	const [status, setStatus] = useState("PENDENTE");
	const [cart, setCart] = useState<Record<string, number>>({});
    const [prices, setPrices] = useState<Record<string, number>>({});

	useEffect(() => {
        if (order) {
			setPayment((order?.paymentMethod as PaymentMethod) || "dinheiro");
			setPaymentConfirmed(Boolean(order?.isPaid));
			setStatus(order?.status || "PENDENTE");

            const initialQty: Record<string, number> = {};
            const initialPrices: Record<string, number> = {};

			order?.products.forEach((product) => {
				initialQty[product.id] = Number(product.quantity);

                const discount = product.discount || 0;
                const originalPrice = product.price || 0;
                const finalPrice = originalPrice - (originalPrice * (discount / 100));

                initialPrices[product.id] = Number(finalPrice.toFixed(2));
			});

			setCart(initialQty);
            setPrices(initialPrices);
		}
	}, [order]);

    const productsList = useMemo(
		() =>
			Object.entries(cart)
				.filter(([, qty]) => qty > 0)
				.map(([productId, qty]) => {
					const product = products.find((p) => p.id === productId);
					const orderProduct = order?.products.find((p) => p.id === productId);

					const originalPrice = product?.price ?? orderProduct?.price ?? 0;
					const customPrice = prices[productId] !== undefined ? prices[productId] : originalPrice;

					let discountPercentage = 0;
					if (customPrice !== undefined && customPrice < originalPrice && originalPrice > 0) {
						discountPercentage = Number((((originalPrice - customPrice) / originalPrice) * 100).toFixed(2));
					}

					return {
						productId,
						productName: product?.name || orderProduct?.name || "Produto",
						qty,
						unitPrice: originalPrice,
						discount: discountPercentage
					};
				}),
		[cart, prices, products, order?.products],
	);

	const itemsForList = Object.entries(cart)
		.filter(([, qty]) => qty > 0)
		.map(([pid, qty]) => {
			const p = products.find(x => x.id === pid);
			const orderProduct = order?.products.find(x => x.id === pid);
			const originalPrice = p?.price ?? orderProduct?.price ?? 0;
			const unitPrice = prices[pid] !== undefined ? prices[pid] : originalPrice;
			return { productId: pid, qty, unitPrice };
		});

	const newTotal = itemsForList.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
	const newOriginalPrice = productsList.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

	const sortedProducts = [...products].sort((a, b) => {
		const qtyA = cart[a.id] || 0;
		const qtyB = cart[b.id] || 0;
		if (qtyB !== qtyA) return qtyB - qtyA;
		return a.name.localeCompare(b.name);
	});


	function adjustQty(productId: string, delta: number) {
		setCart((prev) => {
			const qty = Math.max(0, (prev[productId] || 0) + delta);
			const next = { ...prev };
			if (qty === 0) delete next[productId];
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
				status,
				products: productsList.map((item) => ({
					productId: item.productId,
					quantity: item.qty,
                    discount: item.discount
				})),
			});
			toast.success("Pedido atualizado");
			navigate({ to: "/orders" });
		} catch (error) {
			console.error(error);
			toast.error("Erro ao atualizar pedido");
		}
	}

    function setUnitPrice(productId: string, price: number) {
		setPrices((prev) => ({ ...prev, [productId]: price }));
	}

	function removeItem(productId: string) {
		setCart((prev) => {
			const next = { ...prev };
			delete next[productId];
			return next;
		});
		setPrices((prev) => {
			const next = { ...prev };
			delete next[productId];
			return next;
		});
	}

	async function handleDelete() {
		if (!order) return;
		try {
			await deleteOrder(order.id);
			toast.success("Pedido deletado com sucesso");
			navigate({ to: "/orders" });
		} catch (error) {
			console.error(error);
			toast.error("Erro ao deletar pedido");
		}
	}

	if (loadingProducts || loadingOrder) {
		return (
			<div className="p-6 text-center text-muted-foreground mt-20">
				Carregando pedido...
			</div>
		);
	}

	if (!order) {
		return <PageHeader title="Pedido não encontrado" backTo="/orders" />;
	}


	return (
		<div className="flex flex-col min-h-screen pb-36">
			<PageHeader
				title="Editar Pedido"
				subtitle={order.clientName}
				backTo="/orders"
			/>

            <section className="px-4 pb-3 grid grid-cols-2 gap-2">
                <button
                    onClick={() => shareOrderWhatsApp(order)}
                    className="font-normal bg-card border border-border rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs text-primary hover:bg-muted/30"
                >
                <MessageCircle className="w-4 h-4 text-primary" /> Enviar WhatsApp
                </button>
                <button
                    onClick={() => exportOrderPDF(order)}
                    className="font-normal bg-card border border-border rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs text-primary hover:bg-muted/30"
                >
                <FileDown className="w-4 h-4 text-primary" /> Baixar PDF
                </button>
            </section>

			<section className="px-4 pb-3">
				<div className="bg-card rounded-2xl border border-border p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
						Total atualizado
					</p>

                    <div className="flex flex-col">
                        {order.products.some(p => p.discount > 0) && (
                            <span className={`text-sm line-through font-normal text-foreground/70`}>
                                {formatCurrency(newOriginalPrice)}
                            </span>
                        )}
                        <p className="text-primary text-4xl tracking-tighter font-normal">
                            {formatCurrency(newTotal)}
                        </p>
                    </div>
					<div className="flex items-center justify-between border-t border-border mt-4 pt-3 text-xs text-muted-foreground">
						<span>
							{newTotal} {newTotal === 1 ? "item" : "itens"}
						</span>
						<span>
							{new Date(order.createdAt).toLocaleString("pt-BR", {
								day: "2-digit",
								month: "2-digit",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</div>
				</div>
			</section>


			<section className="px-4 pb-3">
                <LineItemsList
					items={itemsForList}
					products={sortedProducts}
					onAdjustQty={adjustQty}
					onSetUnitPrice={setUnitPrice}
					onRemove={removeItem}
				/>
			</section>

			<section className="px-4 pb-3 space-y-6">
				<SectionLabel className="mt-4">Forma de Pagamento</SectionLabel>
				<PaymentSelector value={payment} onChange={setPayment} />

				<Checkbox
					checked={paymentConfirmed}
					onChange={setPaymentConfirmed}
					label="Pagamento recebido"
				/>

				<SectionLabel className="mt-6">Status do Pedido</SectionLabel>
				<StatusSelector value={status} onChange={setStatus} />

                {!showDeleteConfirm && (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full mt-3 py-2.5 rounded-xl text-xs font-normal border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Deletar Pedido
                    </button>
                )}

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

					{showDeleteConfirm && (
						<div className="mt-3 space-y-2">
							<p className="text-xs text-muted-foreground text-center mb-3">
								Tem certeza que deseja deletar este pedido? Esta ação não pode
								ser desfeita.
							</p>
							<div className="flex gap-2">
								<button
									onClick={() => setShowDeleteConfirm(false)}
									className="flex-1 py-2.5 rounded-xl text-xs font-normal border border-border bg-card text-foreground hover:bg-muted transition-colors"
								>
									Cancelar
								</button>
								<button
									onClick={handleDelete}
									disabled={isDeleting}
									className="flex-1 py-2.5 rounded-xl text-xs font-normal bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isDeleting ? "Deletando..." : "Confirmar Deleção"}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
