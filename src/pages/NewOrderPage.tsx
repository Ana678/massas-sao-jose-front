import { useEffect, useState } from "react";
import { Check, Calendar, Sparkles } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ProductGrid from "@/components/ProductGrid";
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
	const [payment, setPayment] = useState<"pix" | "cartao" | "dinheiro">(
		"dinheiro",
	);

	const [isPaid, setIsPaid] = useState(false);
	const [deliveryType, setDeliveryType] = useState<DeliveryType>("hoje");

	const dayCities = dayParam ? DELIVERY_ROUTES[dayParam] || [] : [];

	function loadPredictiveOrder(client: Client) {
		if (!client.averageOrder) return;
	}

	function tapProduct(pid: string) {
		setCart((prev) => ({ ...prev, [pid]: (prev[pid] || 0) + 1 }));
	}

	function adjustquantity(pid: string, delta: number) {
		setCart((prev) => {
			const q = Math.max(0, (prev[pid] || 0) + delta);
			const next = { ...prev };
			if (q === 0) delete next[pid];
			else next[pid] = q;
			return next;
		});
	}

	const lineItems = Object.entries(cart).map(([pid, quantity]) => {
		const product = apiProducts.find((x) => x.id === pid);
		return {
			productId: pid,
			productName: product?.name || "",
			quantity,
			price: product?.price || 0,
		};
	});

	const total = lineItems.reduce((s, i) => s + i.quantity * i.price, 0);
	const totalItems = lineItems.reduce((s, i) => s + i.quantity, 0);
	const orderType: OrderType = dayParam ? "PREVISAO_ROTA" : "ENCOMENDA";

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	let targetDate = today.toISOString().split("T")[0];

	if (deliveryType === "agendado" && selectedClientData?.city) {
		const nextDelivery = getNextDeliveryDate(selectedClientData.city, today);
		targetDate = nextDelivery.toISOString().split("T")[0];
	}

	function submit() {
		if (!selectedClientId || lineItems.length === 0) return;

		const payload = {
			clientId: selectedClientId,
			type: orderType,
			paymentMethod: payment,
			deliveryFee: 0,
			isPaid: deliveryType === "hoje" ? isPaid : false,
			status: deliveryType === "hoje" ? "ENTREGUE" : "PENDENTE",
			targetDate,
			products: lineItems.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
			})),
		};

		createOrder(payload, {
			onSuccess: () => {
				navigate({ to: "/orders" });
			},
		});
	}

	if (loadingClients || loadingProducts) {
		return (
			<LoadingState
				message="Carregando tela de vendas..."
				className="p-6 text-center mt-20"
			/>
		);
	}

	useEffect(() => {
		if (selectedClientId) {
			const client = clients?.find((c) => c.id === selectedClientId) || null;
			setSelectedClientData(client);
		}
	}, [selectedClientId, clients]);

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

			<section className="px-4 pb-6 flex flex-col gap-2">
				<SectionLabel className="mt-4">Selecione os Itens</SectionLabel>
				<ProductGrid
					products={apiProducts}
					quantities={cart}
					onTap={tapProduct}
					onAdjust={adjustquantity}
				/>
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
							{new Date(targetDate).toLocaleDateString("pt-BR")}
						</span>
					</div>
				)}
				{deliveryType === "hoje" && (
					<>
						<SectionLabel className="mt-4">Forma de Pagamento</SectionLabel>
						<PaymentSelector value={payment} onChange={setPayment} />

						<div className="flex items-center justify-between mt-2 bg-card border border-border rounded-xl px-4 py-3">
							<span className="text-sm text-foreground">
								Pagamento recebido na hora?
							</span>
							<button
								onClick={() => setIsPaid(!isPaid)}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									isPaid ? "bg-primary" : "bg-muted"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										isPaid ? "translate-x-6" : "translate-x-1"
									}`}
								/>
							</button>
						</div>
					</>
				)}
			</section>
			{lineItems.length > 0 && selectedClientId && (
				<div className="fixed bottom-0 w-full max-w-md z-40">
					<div className="bg-card p-4 border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
						<div className="flex items-center justify-between mb-3">
							<div>
								<p className="text-muted-foreground text-xs">
									{totalItems} {totalItems === 1 ? "item" : "itens"}
								</p>
								<p className="text-primary text-2xl tracking-tighter font-normal">
									{formatCurrency(total)}
								</p>
							</div>
							{lineItems.length > 0 && (
								<div className="text-right max-w-[50%]">
									{lineItems.slice(0, 3).map((i) => (
										<p
											key={i.productId}
											className="text-muted-foreground text-[10px] truncate"
										>
											{i.quantity}× {i.productName}
										</p>
									))}
									{lineItems.length > 3 && (
										<p className="text-muted-foreground text-[10px]">
											+{lineItems.length - 3} mais
										</p>
									)}
								</div>
							)}
						</div>
						<button
							onClick={submit}
							disabled={!selectedClientId || lineItems.length === 0 || isSaving}
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
			)}
		</div>
	);
}
