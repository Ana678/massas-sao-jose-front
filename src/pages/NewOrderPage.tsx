import { useEffect, useState, useMemo } from "react";
import { toDateStr } from "@/lib/date";
import { Check, Calendar, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import LineItemsList from "@/components/LineItemsList";
import { buildDiscount, DEFAULT_DISCOUNT_TYPE, type DiscountType } from "@/lib/discount";
import PaymentSelector from "@/components/PaymentSelector";
import SectionLabel from "@/components/form/SectionLabel";
import LoadingState from "@/components/layout/LoadingState";
import { DELIVERY_ROUTES, type DayOfWeek } from "@/lib/data";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/utils";
import { ModalClientPicker } from "@/components/ModalClientPicker";

import { useProducts } from "@/lib/hooks/useProduct";
import { useClients } from "@/lib/hooks/useClients";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import type { Client } from "@/lib/types";

type OrderType = "ENCOMENDA" | "PREVISAO_ROTA" | "PRONTA_ENTREGA";
type DeliveryType = "hoje" | "agendado";

const DAY_NAME_MAP: Record<number, DayOfWeek | null> = {
	0: null,
	1: "segunda",
	2: null,
	3: "quarta",
	4: "quinta",
	5: "sexta",
	6: "sabado",
};

function getNextDeliveryDate(city: string, todayDate: Date): Date {
	const nextDate = new Date(todayDate);
	nextDate.setDate(nextDate.getDate() + 1);

	for (let i = 0; i < 30; i++) {
		const dayOfWeek = nextDate.getDay();
		const dayName = DAY_NAME_MAP[dayOfWeek];

		if (dayName && DELIVERY_ROUTES[dayName]?.includes(city)) {
			return new Date(nextDate);
		}
		nextDate.setDate(nextDate.getDate() + 1);
	}

	return new Date(todayDate);
}

export default function NewOrderPage() {
	const navigate = useNavigate();
	const { dia } = useSearch({ from: "/_authenticated/order/new" });
	const dayParam = dia as DayOfWeek | null;

	const { data: apiProducts = [], isLoading: loadingProducts } = useProducts();
	const { data: clients = [], isLoading: loadingClients } = useClients();
	const { mutate: createOrder, isPending: isSaving } = useCreateOrder();

	const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
		undefined,
	);
	const [selectedClientData, setSelectedClientData] = useState<Client | null>(
		null,
	);

	const [cart, setCart] = useState<Record<string, number>>({});
	const [prices, setPrices] = useState<Record<string, number>>({});
	const [discountTypes, setDiscountTypes] = useState<Record<string, DiscountType>>({});

	const [payment, setPayment] = useState<"pix" | "cartao" | "dinheiro">(
		"dinheiro",
	);

	const [isPaid, setIsPaid] = useState(false);
	const [deliveryType, setDeliveryType] = useState<DeliveryType>("hoje");

	const dayCities = dayParam ? DELIVERY_ROUTES[dayParam] || [] : [];

	function loadPredictiveOrder(client: Client) {
		if (!client.averageOrder) return;
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

	function setUnitPrice(productId: string, price: number) {
		setPrices((prev) => ({ ...prev, [productId]: price }));
	}

	function setDiscountType(productId: string, discountType: DiscountType) {
		setDiscountTypes((prev) => ({ ...prev, [productId]: discountType }));
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

	const productsList = useMemo(
		() =>
			Object.entries(cart)
				.filter(([, qty]) => qty > 0)
				.map(([productId, qty]) => {
					const product = apiProducts.find((p) => p.id === productId);
					const originalPrice = product?.price || 0;
					const customPrice = prices[productId] !== undefined ? prices[productId] : originalPrice;

					const { discount, discountType } = buildDiscount(
						originalPrice,
						customPrice,
						discountTypes[productId] ?? DEFAULT_DISCOUNT_TYPE,
					);

					return {
						productId,
						productName: product?.name || "Produto",
						qty,
						unitPrice: originalPrice,
						customPrice,
						discount,
						discountType,
					};
				}),
		[cart, prices, discountTypes, apiProducts],
	);

	const itemsForList = useMemo(
		() =>
			Object.entries(cart)
				.filter(([, qty]) => qty > 0)
				.map(([pid, qty]) => {
					const p = apiProducts.find((x) => x.id === pid);
					const originalPrice = p?.price ?? 0;
					const unitPrice = prices[pid] !== undefined ? prices[pid] : originalPrice;
					return {
						productId: pid,
						qty,
						unitPrice,
						discountType: discountTypes[pid] ?? DEFAULT_DISCOUNT_TYPE,
					};
				}),
		[cart, prices, discountTypes, apiProducts],
	);

	const total = useMemo(() => itemsForList.reduce((sum, item) => sum + item.qty * item.unitPrice, 0), [itemsForList]);
	const originalTotal = useMemo(() => productsList.reduce((sum, item) => sum + item.qty * item.unitPrice, 0), [productsList]);
	const totalItems = useMemo(() => itemsForList.reduce((sum, item) => sum + item.qty, 0), [itemsForList]);

	const isOrderReady = Boolean(selectedClientId) && productsList.length > 0;

	const orderType: OrderType = dayParam ? "PREVISAO_ROTA" : "ENCOMENDA";

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	let targetDate = toDateStr(today);

	if (deliveryType === "agendado" && selectedClientData?.city) {
		const nextDelivery = getNextDeliveryDate(selectedClientData.city, today);
		targetDate = toDateStr(nextDelivery);
	}

	const sortedProducts = useMemo(
		() =>
			[...apiProducts].sort((a, b) => {
				const qtyA = cart[a.id] || 0;
				const qtyB = cart[b.id] || 0;
				if (qtyB !== qtyA) return qtyB - qtyA;
				return a.name.localeCompare(b.name);
			}),
		[apiProducts, cart],
	);

	function submit() {
		if (!selectedClientId || productsList.length === 0) return;

		const isPaidNow = deliveryType === "hoje" && isPaid;

		const payload = {
			clientId: selectedClientId,
			type: orderType,
			// Mesma regra do DeliveryConfirmModal: sem pagamento não há forma de
			// pagamento a registrar, então vai o default da API.
			paymentMethod: isPaidNow ? payment : "dinheiro",
			deliveryFee: 0,
			isPaid: isPaidNow,
			status: deliveryType === "hoje" ? "ENTREGUE" : "PENDENTE",
			targetDate: deliveryType === "hoje" ? undefined : targetDate,
			products: productsList.map((item) => ({
				productId: item.productId,
				quantity: item.qty,
				discount: item.discount,
				discountType: item.discountType,
			})),
		};

		createOrder(payload, {
			onSuccess: () => {
				navigate({ to: "/orders" });
			},
		});
	}

	useEffect(() => {
		if (selectedClientId) {
			const client = clients?.find((c) => c.id === selectedClientId) || null;
			setSelectedClientData(client);
		}
	}, [selectedClientId, clients]);

	if (loadingClients || loadingProducts) {
		return (
			<LoadingState
				message="Carregando tela de vendas..."
				className="p-6 text-center mt-20"
			/>
		);
	}

	return (
		<div className="flex flex-col h-full min-h-screen pb-20">
			<PageHeader title="Novo Pedido" backTo="/" />

			{dayParam && (
				<section className="px-4 pb-2">
					<div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 text-xs text-primary">
						<Calendar className="w-4 h-4 inline-block mr-1" />
						Pedido para rota de{" "}
						<span className="font-medium capitalize">{dayParam}</span>
						{dayCities.length > 0 && ` — ${dayCities.join(", ")}`}
					</div>
				</section>
			)}

			<section className="px-4 pb-3">
				<ModalClientPicker
					clients={clients}
					selectedClientId={selectedClientId}
					onSelect={(client: Client) => setSelectedClientId(client.id)}
					dayParam={dayParam}
					dayCities={dayCities}
				/>

				{selectedClientData?.averageOrder &&
					Object.keys(selectedClientData.averageOrder).length > 0 &&
					Object.keys(cart).length === 0 && (
						<button
							onClick={() => loadPredictiveOrder(selectedClientData)}
							className="w-full mt-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-primary transition-transform active:scale-[0.98]"
						>
							<Sparkles className="w-4 h-4" />
							<span>Carregar pedido padrão desse cliente</span>
						</button>
					)}
			</section>

			<section className="px-4 pb-3 flex flex-col gap-2">
				<SectionLabel className="mt-6">Tipo de Entrega</SectionLabel>
				<div className="flex gap-2">
					<button
						onClick={() => setDeliveryType("hoje")}
						className={`flex-1 py-2.5 rounded-xl text-xs font-normal border transition-colors ${
							deliveryType === "hoje"
								? "bg-primary text-primary-foreground border-primary"
								: "bg-card text-foreground border-border"
						}`}
					>
						Entrega Hoje
					</button>
					<button
						onClick={() => setDeliveryType("agendado")}
						className={`flex-1 py-2.5 rounded-xl text-xs font-normal border transition-colors ${
							deliveryType === "agendado"
								? "bg-primary text-primary-foreground border-primary"
								: "bg-card text-foreground border-border"
						}`}
					>
						Agendar Entrega
					</button>
				</div>

				{deliveryType === "agendado" && selectedClientData?.city && (
					<div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 text-xs text-primary">
						<Calendar className="w-3.5 h-3.5 inline-block mr-1.5" />
						Próxima entrega em{" "}
						<span className="font-medium">{selectedClientData.city}</span> será
						em{" "}
						<span className="font-medium">
							{new Date(`${targetDate}T00:00:00`).toLocaleDateString("pt-BR")}
						</span>
					</div>
				)}
				{deliveryType === "hoje" && (
					<>
						<SectionLabel className="mt-4">Pagamento</SectionLabel>

						<div className="grid grid-cols-2 gap-2">
							<button
								onClick={() => setIsPaid(true)}
								className={`rounded-xl border py-3 text-xs transition-colors font-normal ${isPaid ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
							>
								Já pagou
							</button>
							<button
								onClick={() => setIsPaid(false)}
								className={`rounded-xl border py-3 text-xs transition-colors font-normal ${!isPaid ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
							>
								Ficou pendente
							</button>
						</div>

						{isPaid && (
							<section className="flex flex-col gap-2">
								<label className="text-muted-foreground text-xs uppercase tracking-widest mt-2">
									Forma de Pagamento
								</label>
								<PaymentSelector value={payment} onChange={setPayment} />
							</section>
						)}
					</>
				)}
			</section>

			<section className="px-4 pb-6 flex flex-col gap-2">
				<SectionLabel className="mt-4">Selecione os Itens</SectionLabel>
				<LineItemsList
					items={itemsForList}
					products={sortedProducts}
					onAdjustQty={adjustQty}
					onSetUnitPrice={setUnitPrice}
					onSetDiscountType={setDiscountType}
					onRemove={removeItem}
				/>
			</section>
			<div className="fixed bottom-0 w-full max-w-md z-40">
				<div className="bg-card p-4 border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
					{!isOrderReady ? (
						<p className="text-muted-foreground text-sm text-center mb-3">
							{!selectedClientId
								? "Adicione um cliente para começar"
								: "Adicione os itens para começar"}
						</p>
					) : (
						<div className="flex items-center justify-between mb-3">
							<div>
								<p className="text-muted-foreground text-xs">
									{totalItems} {totalItems === 1 ? "item" : "itens"}
								</p>
								<div className="flex flex-col">
									{productsList.some((p) => p.discount > 0) && (
										<span className="text-sm line-through font-normal text-foreground/70">
											{formatCurrency(originalTotal)}
										</span>
									)}
									<p className="text-primary text-2xl tracking-tighter font-normal">
										{formatCurrency(total)}
									</p>
								</div>
							</div>
							<div className="text-right max-w-[50%]">
								{productsList.slice(0, 3).map((i) => (
									<p
										key={i.productId}
										className="text-muted-foreground text-[10px] truncate"
									>
										{i.qty}× {i.productName}
									</p>
								))}
								{productsList.length > 3 && (
									<p className="text-muted-foreground text-[10px]">
										+{productsList.length - 3} mais
									</p>
								)}
							</div>
						</div>
					)}
					<button
						onClick={submit}
						disabled={!isOrderReady || isSaving}
						className="w-full bg-primary text-primary-foreground rounded-xl p-3.5 flex items-center justify-center gap-2 font-normal disabled:opacity-40 transition-transform active:scale-[0.98]"
					>
						{isSaving ? (
							"Salvando..."
						) : (
							<>
								<Check className="w-5 h-5" />
								Confirmar Pedido
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
