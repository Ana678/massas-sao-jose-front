import { useDeferredValue, useMemo, useState } from "react";
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
import SearchInput from "@/components/form/SearchInput";
import { ALL_CITIES } from "@/lib/data";

export default function OrdersPage() {
	const { data: orders = [], isLoading } = useOrdersList();
	const { data: clients = [] } = useClients();

	const [paymentFilter, setPaymentFilter] = useState<
		"agendados" | "todos" | "pago" | "pendente"
	>("todos");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
    const [cityFilter, setCityFilter] = useState("todas");
	const [methodFilter, setMethodFilter] = useState<
		"todos" | "pix" | "cartao" | "dinheiro"
	>("todos");


    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);

	const advancedFiltersCount = [
		startDate,
		endDate,
		cityFilter !== "todas",
		methodFilter !== "todos",
	].filter(Boolean).length;

	const cityOptions = [
		{ value: "todas", label: "Todas as cidades" },
		...ALL_CITIES.map((city) => ({ value: city, label: city })),
	];
	const methodOptions = [
		{ value: "todos", label: "Todas as formas" },
		{ value: "pix", label: "Pix" },
		{ value: "cartao", label: "Cartão" },
		{ value: "dinheiro", label: "Dinheiro" },
	];

    const filtered = useMemo(() => {
        let result = orders;

        if (deferredSearchQuery) {
            const lowerQuery = deferredSearchQuery.toLowerCase();
            result = result.filter((o) =>
                o.clientName.toLowerCase().includes(lowerQuery)
            );
        }

        result = result.filter((o) => {
            if (paymentFilter === "pago") return o.isPaid;
            if (paymentFilter === "pendente") return o.status !== "ENTREGUE" || !o.isPaid;
            if (paymentFilter === "agendados")
                return o.createdAt.slice(0, 10) > new Date().toISOString().split("T")[0];
            return true;
        });

        if (startDate) {
            result = result.filter((o) => o.createdAt.slice(0, 10) >= startDate);
        }
        if (endDate) {
            result = result.filter((o) => o.createdAt.slice(0, 10) <= endDate);
        }

        if (cityFilter !== "todas") {
            const clientsInCity = clients.filter((c) => c.city === cityFilter);
            const validClientIds = clientsInCity.map(c => c.id);
            result = result.filter((o) => validClientIds.includes(o.clientId));
        }

        if (methodFilter !== "todos") {
            result = result.filter((o) => o.paymentMethod === methodFilter);
        }

        return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    }, [
        orders,
        clients,
        deferredSearchQuery,
        paymentFilter,
        startDate,
        endDate,
        cityFilter,
        methodFilter
    ]);

	const pendingPaymentCount = orders.filter((o) => o.status !== "ENTREGUE" || !o.isPaid).length;

	const futureCount = orders.filter(
		(o) => o.createdAt.slice(0, 10) > new Date().toISOString().split("T")[0],
	).length;

	const paidCount = orders.filter((o) => o.isPaid).length;

	function clearAdvancedFilters() {
		setStartDate("");
		setEndDate("");
		setCityFilter("todas");
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
							label="Cidade"
							value={cityFilter}
							onChange={setCityFilter}
							options={cityOptions}
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

                <div className="mt-4">
                    <SearchInput
                        placeholder="Buscar pedido por nome de cliente..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>
			</section>

			<section className="px-6 pb-6 space-y-2">
                <p className="text-xs font-normal text-muted-foreground"> Mostrando {filtered.length} de {orders.length} pedidos</p>

				{isLoading && <LoadingState message="Buscando histórico..." />}

				{!isLoading && filtered.length === 0 && (
					<EmptyState message="Nenhum pedido encontrado" />
				)}

				{!isLoading &&
					filtered.map((order) => <OrderCard key={order.id} order={order} city={clients.find((c) => c.id === order.clientId)?.city } />)}
			</section>
		</div>
	);
}
