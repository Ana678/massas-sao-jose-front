import { useState, useMemo } from "react";
import {
	DELIVERY_ROUTES,
	type DayOfWeek,
	getSkippedClients,
	toggleSkipClient,
} from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import DaySelector from "@/components/DaySelector";
import QtyAdjuster from "@/components/QtyAdjuster";
import { Plus, X, RotateCcw, Cloud, Save } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import {
	useOrdersListByCity,
	useCreateOrder,
	useUpdateOrder,
} from "@/lib/hooks/useOrders";
import { useProducts } from "@/lib/hooks/useProduct";
import { useClients } from "@/lib/hooks/useClients";

export default function ProductionPage() {
	const { data: products = [], isLoading: loadingProducts } = useProducts();
	const { data: clients = [], isLoading: loadingClients } = useClients();
	const { mutate: createOrder, isPending: isSaving } = useCreateOrder();
	const { mutate: updateOrder } = useUpdateOrder();

	const getToday = new Date()
		.toLocaleDateString("pt-BR", { weekday: "long" })
		.replace("-feira", "") as DayOfWeek;
	const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
		getToday in DELIVERY_ROUTES ? getToday : "segunda",
	);

	const targetDateObj = useMemo(() => {
		const dayMap: Record<string, number> = {
			domingo: 0,
			segunda: 1,
			terça: 2,
			quarta: 3,
			quinta: 4,
			sexta: 5,
			sabado: 6,
		};
		const today = new Date();
		const currentDayIndex = today.getDay();
		const targetDayIndex = dayMap[selectedDay];

		let daysToAdd = targetDayIndex - currentDayIndex;

		if (daysToAdd <= 0) {
			daysToAdd += 7;
		}

		const date = new Date();
		date.setDate(today.getDate() + daysToAdd);
		return date;
	}, [selectedDay]);

	const targetDateStr = targetDateObj.toISOString().slice(0, 10);
	const formattedDateView = targetDateObj.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
	});

	const cities = DELIVERY_ROUTES[selectedDay] || [];
	const { data: latestOrders = [], isLoading: loadingOrders } =
		useOrdersListByCity(cities, targetDateStr);

	const [editedOrders, setEditedOrders] = useState<
		Record<string, Record<string, number>>
	>({});
	const [skipped, setSkipped] = useState(getSkippedClients());

	const allDayClients = clients.filter((c) => cities.includes(c.city));
	const skippedIds = skipped[selectedDay] || [];
	const dayClients = allDayClients.filter((c) => !skippedIds.includes(c.id));
	const skippedClients = allDayClients.filter((c) => skippedIds.includes(c.id));

	const getBaselineOrder = (clientId: string) => {
		const lastOrder = latestOrders.find((o) => o.clientId === clientId);
		const base: Record<string, number> = {};
		if (lastOrder) {
			lastOrder.products.forEach((p) => {
				base[p.id] = Number(p.quantity) || 0;
			});
		}
		return base;
	};

	const getClientOrder = (clientId: string): Record<string, number> => {
		if (editedOrders[clientId]) return editedOrders[clientId];
		return getBaselineOrder(clientId);
	};

	const { forecast, totalUnits } = useMemo(() => {
		const tempForecast: Record<string, number> = {};
		dayClients.forEach((client) => {
			const order = getClientOrder(client.id);
			Object.entries(order).forEach(([pid, qty]) => {
				tempForecast[pid] = (tempForecast[pid] || 0) + Number(qty);
			});
		});

		const total = Object.values(tempForecast).reduce(
			(s, v) => s + Number(v),
			0,
		);
		return { forecast: tempForecast, totalUnits: total };
	}, [dayClients, editedOrders, latestOrders]);

	function adjustQty(clientId: string, productId: string, delta: number) {
		setEditedOrders((prev) => {
			const current = prev[clientId] || getBaselineOrder(clientId);
			const newQty = Math.max(
				0,
				Number(current[productId] || 0) + Number(delta),
			);
			const updated = { ...current, [productId]: newQty };
			if (updated[productId] === 0) delete updated[productId];
			return { ...prev, [clientId]: updated };
		});
	}

	function saveFutureOrder(clientId: string) {
		const orderToSave = editedOrders[clientId];
		if (!orderToSave) return;

		const productsList = Object.entries(orderToSave)
			.filter(([, qty]) => Number(qty) > 0)
			.map(([pid, qty]) => ({ productId: pid, quantity: Number(qty) }));

		const existingOrder = latestOrders.find((o) => o.clientId === clientId);

		if (existingOrder) {
			updateOrder(
				{
					id: existingOrder.id,
					paymentMethod: "dinheiro",
					isPaid: existingOrder.isPaid,
					status: existingOrder.status,
					targetDate: targetDateStr,
					products: productsList,
				},
				{
					onSuccess: () => {
						toast.success("Encomenda atualizada com sucesso!");
						setEditedOrders((prev) => {
							const next = { ...prev };
							delete next[clientId];
							return next;
						});
					},
				},
			);
		} else {
			createOrder(
				{
					clientId,
					products: productsList,
					paymentMethod: "dinheiro",
					isPaid: false,
					status: "PENDENTE",
					targetDate: targetDateStr,
				},
				{
					onSuccess: () => {
						toast.success("Encomenda agendada com sucesso!");
						setEditedOrders((prev) => {
							const next = { ...prev };
							delete next[clientId];
							return next;
						});
					},
				},
			);
		}
	}

	function handleSkip(clientId: string) {
		const updated = toggleSkipClient(selectedDay, clientId);
		setSkipped({ ...updated });
		toast.success("Cliente removido da previsão");
	}

	function handleRestore(clientId: string) {
		const updated = toggleSkipClient(selectedDay, clientId);
		setSkipped({ ...updated });
		toast.success("Cliente restaurado na previsão");
	}

	const isLoading = loadingProducts || loadingClients || loadingOrders;

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
				<Cloud className="w-8 h-8 animate-pulse text-primary" />
				<p>Calculando previsão de produção...</p>
			</div>
		);
	}

	return (
		<div className="pb-24">
			<PageHeader title="Produção" subtitle="Previsão e Agendamento" />

			<section className="px-6 pb-2">
				<DaySelector
					value={selectedDay}
					onChange={(d) => {
						setSelectedDay(d);
						setEditedOrders({});
					}}
					formattedDate={formattedDateView}
				/>
			</section>

			<section className="px-6 py-2">
				<div className="border border-border bg-card/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
					<p className="text-foreground text-sm">
						Total a Produzir:{" "}
						<span className="font-bold text-primary text-base ml-1">
							~{totalUnits} un.
						</span>
					</p>
					{Object.keys(editedOrders).length > 0 && (
						<span className="text-[10px] uppercase tracking-wider bg-accent/10 text-accent px-2 py-1 rounded font-medium">
							Alterações pendentes
						</span>
					)}
				</div>
			</section>

			<section className="px-6 py-4">
				<h2 className="font-display text-lg tracking-tight mb-3">
					Resumo por Produto
				</h2>
				<div className="grid grid-cols-2 gap-2">
					{products.map((product) => {
						const qty = forecast[product.id] || 0;
						return (
							<div
								key={product.id}
								className={`rounded-xl p-3 text-center border transition-colors ${qty > 0 ? "bg-primary/5 border-primary/30" : "bg-card border-border opacity-60"}`}
							>
								<p className="text-foreground text-[11px] font-medium leading-tight line-clamp-2 min-h-6.5">
									{product.name}
								</p>
								<p
									className={`text-xl font-bold mt-1 ${qty > 0 ? "text-primary" : "text-muted-foreground"}`}
								>
									{qty}
								</p>
							</div>
						);
					})}
				</div>
			</section>

			<section className="px-6 py-4 pb-8">
				<div className="flex justify-between items-start mb-3">
					<div className="flex flex-col">
						<h2 className="font-display text-lg tracking-tight">
							Clientes na Rota
						</h2>
						<span className="text-muted-foreground text-xs">
							{dayClients.length} clientes
						</span>
					</div>
					<Link to="/order/new" search={{ dia: selectedDay }}>
						<button className="bg-primary text-primary-foreground rounded-lg px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-medium flex items-center gap-1 active:scale-95 transition-transform shadow-sm">
							<Plus className="w-3 h-3" />
							Pedido
						</button>
					</Link>
				</div>

				<div className="space-y-3">
					{dayClients.map((client) => {
						const order = getClientOrder(client.id);
						const hasNF =
							client.needFiscalNote || !!(client.socialReason && client.cnpj);
						const isEdited = !!editedOrders[client.id];

						return (
							<div
								key={client.id}
								className={`bg-card rounded-xl p-4 border transition-colors ${isEdited ? "border-primary/50 shadow-sm" : "border-border"}`}
							>
								<div className="flex justify-between items-start mb-3">
									<div>
										<p className="text-foreground text-sm font-medium">
											{client.name}
										</p>
										<p className="text-muted-foreground text-[11px] mt-0.5">
											{client.city}
										</p>
									</div>
									<div className="flex items-center gap-1.5">
										{hasNF && (
											<span className="text-[9px] uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
												NF
											</span>
										)}
										{isEdited && (
											<span className="text-[9px] uppercase bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">
												Editado
											</span>
										)}
										<button
											onClick={() => handleSkip(client.id)}
											className="text-destructive/60 hover:text-destructive p-1 rounded transition-colors"
											title="Pular cliente"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>

								<div className="space-y-1.5">
									{products.map((product) => {
										const qty = order[product.id] || 0;
										if (qty === 0 && !isEdited) return null;
										return (
											<QtyAdjuster
												key={product.id}
												label={product.name}
												qty={Number(qty)}
												onAdjust={(delta) =>
													adjustQty(client.id, product.id, delta)
												}
												dimmed={qty === 0}
											/>
										);
									})}

									{!isEdited && Object.keys(order).length < products.length && (
										<button
											onClick={() =>
												setEditedOrders((prev) => ({
													...prev,
													[client.id]: { ...order },
												}))
											}
											className="text-muted-foreground text-xs mt-2 hover:text-foreground font-normal w-full border-t pt-2 border-border "
										>
											<Plus className="w-3 h-3 inline-block mr-1" />
											ajustar quantidades
										</button>
									)}

									{isEdited && (
										<button
											onClick={() => saveFutureOrder(client.id)}
											disabled={isSaving}
											className="w-full mt-3 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
										>
											<Save className="w-4 h-4" />
											{isSaving ? "Guardando..." : "Salvar Encomenda"}
										</button>
									)}
								</div>
							</div>
						);
					})}

					{dayClients.length === 0 && (
						<p className="text-muted-foreground text-sm text-center py-8">
							Nenhum cliente na rota deste dia
						</p>
					)}
				</div>

				{skippedClients.length > 0 && (
					<div className="mt-6">
						<p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
							Pulados hoje ({skippedClients.length})
						</p>
						<div className="space-y-1.5">
							{skippedClients.map((c) => (
								<div
									key={c.id}
									className="bg-card/50 rounded-lg px-3 py-2 border border-border/50 flex justify-between items-center opacity-60"
								>
									<div>
										<p className="text-foreground text-sm line-through">
											{c.name}
										</p>
										<p className="text-muted-foreground text-[11px]">
											{c.city}
										</p>
									</div>
									<button
										onClick={() => handleRestore(c.id)}
										className="text-primary text-[10px] uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
									>
										<RotateCcw className="w-3 h-3" />
										Restaurar
									</button>
								</div>
							))}
						</div>
					</div>
				)}
			</section>
		</div>
	);
}
