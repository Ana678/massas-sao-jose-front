import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useOrdersList } from "@/lib/hooks/useOrders";
import { SlidersHorizontal, X } from "lucide-react";
import { useClients } from "@/lib/hooks/useClients";
import Collapsible from "@/components/layout/Collapsible";
import LoadingState from "@/components/layout/LoadingState";
import EmptyState from "@/components/layout/EmptyState";
import DateRangeInput from "@/components/form/DateRangeInput";
import SelectField from "@/components/form/SelectField";
import OrderCard from "@/components/OrderCard";

export default function OrdersPage() {
	const { data: orders = [], isLoading } = useOrdersList();
	const { data: clients = [] } = useClients();

	const [paymentFilter, setPaymentFilter] = useState<
		"agendados" | "todos" | "pago" | "pendente"
	>("todos");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [clientFilter, setClientFilter] = useState("todos");
	const [methodFilter, setMethodFilter] = useState<
		"todos" | "pix" | "cartao" | "dinheiro"
	>("todos");

	const advancedFiltersCount = [
		startDate,
		endDate,
		clientFilter !== "todos",
		methodFilter !== "todos",
	].filter(Boolean).length;
	const clientOptions = [
		{ value: "todos", label: "Todos os clientes" },
		...clients.map((client) => ({ value: client.id, label: client.name })),
	];
	const methodOptions = [
		{ value: "todos", label: "Todas as formas" },
		{ value: "pix", label: "Pix" },
		{ value: "cartao", label: "Cartão" },
		{ value: "dinheiro", label: "Dinheiro" },
	];

	const filtered = orders
		.filter((o) => {
			if (paymentFilter === "pago") return o.isPaid;
			if (paymentFilter === "pendente") return o.status !== "ENTREGUE" || !o.isPaid;
			if (paymentFilter === "agendados")
				return (
					o.createdAt.slice(0, 10) > new Date().toISOString().split("T")[0]
				);
			return true;
		})
		.filter((o) => !startDate || o.createdAt.slice(0, 10) >= startDate)
		.filter((o) => !endDate || o.createdAt.slice(0, 10) <= endDate)
		.filter(
			(o) =>
				clientFilter === "todos" ||
				o.clientName === clients.find((c) => c.id === clientFilter)?.name,
		)
		.filter((o) => methodFilter === "todos" || o.paymentMethod === methodFilter)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

	const pendingPaymentCount = orders.filter((o) => o.status !== "ENTREGUE" || !o.isPaid).length;

	const futureCount = orders.filter(
		(o) => o.createdAt.slice(0, 10) > new Date().toISOString().split("T")[0],
	).length;

	const paidCount = orders.filter((o) => o.isPaid).length;

	function clearAdvancedFilters() {
		setStartDate("");
		setEndDate("");
		setClientFilter("todos");
		setMethodFilter("todos");
	}

	return (
		<div className="pb-24">
			<PageHeader
				title="Pedidos"
				subtitle={`${orders.length} encontrados`}
				backTo="/caixa"
			/>
			<section className="px-6 pb-3">
				<div className="flex gap-2">
					{(
						[
							{ key: "agendados", label: "Agendados", count: futureCount },
							{ key: "todos", label: "Todos", count: orders.length },
							{
								key: "pendente",
								label: "Pendentes",
								count: pendingPaymentCount,
							},
							{ key: "pago", label: "Pagos", count: paidCount },
						] as const
					).map((opt) => {
						const active = paymentFilter === opt.key;
						return (
							<button
								key={opt.key}
								onClick={() => setPaymentFilter(opt.key)}
								className={`flex-1 py-2 rounded-xl text-xs font-normal border transition-colors ${
									active
										? "bg-primary text-primary-foreground border-primary"
										: "bg-card text-foreground border-border"
								}`}
							>
								{opt.label}
								{opt.count > 0 ? ` (${opt.count})` : ""}
							</button>
						);
					})}
				</div>
			</section>

			<section className="px-6 pb-6">
				<Collapsible
					trigger={
						<div className="flex items-center gap-2 w-full">
							<SlidersHorizontal className="w-4 h-4 text-primary" />
							<span className="text-xs font-normal flex-1 text-left">
								Filtros detalhados
							</span>
							<span className="text-muted-foreground text-xs">
								{advancedFiltersCount > 0
									? `${advancedFiltersCount} ativo${advancedFiltersCount > 1 ? "s" : ""}`
									: "Período, cliente e pagamento"}
							</span>
						</div>
					}
				>
					<div className="bg-card rounded-xl border border-border p-3 space-y-3 mt-3">
						<DateRangeInput
							from={startDate}
							to={endDate}
							onFromChange={setStartDate}
							onToChange={setEndDate}
							fromLabel="Início"
							toLabel="Fim"
						/>

						<SelectField
							label="Cliente"
							value={clientFilter}
							onChange={setClientFilter}
							options={clientOptions}
							selectClassName="h-10 text-xs"
						/>

						<SelectField
							label="Forma de pagamento"
							value={methodFilter}
							onChange={(value) =>
								setMethodFilter(value as typeof methodFilter)
							}
							options={methodOptions}
							selectClassName="h-10 text-xs"
						/>

						{advancedFiltersCount > 0 && (
							<button
								onClick={clearAdvancedFilters}
								className="w-full h-9 rounded-lg border border-border text-xs text-foreground flex items-center justify-center gap-2 hover:bg-muted/30 transition-colors"
							>
								<X className="w-3.5 h-3.5" />
								Limpar filtros detalhados
							</button>
						)}
					</div>
				</Collapsible>
			</section>

			<section className="px-6 pb-6 space-y-2">
				{isLoading && <LoadingState message="Buscando histórico..." />}

				{!isLoading && filtered.length === 0 && (
					<EmptyState message="Nenhum pedido encontrado" />
				)}

				{!isLoading &&
					filtered.map((order) => <OrderCard key={order.id} order={order} />)}
			</section>
		</div>
	);
}
