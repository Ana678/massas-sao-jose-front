import { useEffect, useMemo, useState } from "react";
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
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function OrdersPage() {
    const [page, setPage] = useState(1);
	const limit = 50;

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
    const debouncedSearchQuery = useDebounce(searchQuery, 800);

    const activeFilters = useMemo(() => ({
        paymentFilter,
        startDate,
        endDate,
        city: cityFilter,
        paymentMethod: methodFilter,
        search: debouncedSearchQuery
    }), [paymentFilter, startDate, endDate, cityFilter, methodFilter, debouncedSearchQuery]);

    const { data: ordersData, isLoading } = useOrdersList(page, limit, activeFilters);
	const { data: clients = [] } = useClients();

    useEffect(() => {
        setPage(1);
    }, [activeFilters]);

    const orders = ordersData?.data || [];
	const totalOrders = ordersData?.total || 0;
	const totalPages = Math.ceil(totalOrders / limit);

	// A última página quase nunca está cheia, então a faixa tem que sair do
	// offset da página + o que veio, não de orders.length * page.
	const firstShown = (page - 1) * limit + 1;
	const lastShown = (page - 1) * limit + orders.length;

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
				subtitle={`${totalOrders} encontrados`}
				backTo="/caixa"
			/>

			<section className="px-6 pb-3">
				<div className="flex gap-2">
					{(
						[
							{ key: "agendados", label: "Agendados" },
							{ key: "todos", label: "Todos" },
							{ key: "pendente", label: "Pendentes" },
							{ key: "pago", label: "Pagos" },
						] as const
					).map((opt) => {
						const active = paymentFilter === opt.key;
						return (
							<button
								key={opt.key}
								onClick={() => setPaymentFilter(opt.key as any)}
								className={`flex-1 py-2 rounded-xl text-xs font-normal border transition-colors ${
									active
										? "bg-primary text-primary-foreground border-primary"
										: "bg-card text-foreground border-border"
								}`}
							>
								{opt.label}
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
									: "Período, cidade e pagamento"}
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
                {orders.length > 0 && (
                    <p className="text-xs font-normal text-muted-foreground">
                        Mostrando {firstShown}–{lastShown} de {totalOrders} pedidos
                    </p>
                )}

				{isLoading && <LoadingState message="Buscando pedidos..." />}

				{!isLoading && orders.length === 0 && (
					<EmptyState message="Nenhum pedido encontrado com estes filtros" />
				)}

				{!isLoading &&
					orders.map((order) => <OrderCard key={order.id} order={order} city={clients.find((c) => c.id === order.clientId)?.city } />)}

                {/* Controlos de Paginação */}
				{!isLoading && totalPages > 1 && (
					<div className="flex items-center justify-between pt-6 border-t border-border mt-6">
						<button
							onClick={() => setPage(p => Math.max(1, p - 1))}
							disabled={page === 1}
							className="px-4 py-2 text-xs border border-border rounded-xl disabled:opacity-50 transition-colors hover:bg-muted/30"
						>
							Anterior
						</button>
						<span className="text-xs text-muted-foreground font-medium">
							Página {page} de {totalPages}
						</span>
						<button
							onClick={() => setPage(p => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
							className="px-4 py-2 text-xs border border-border rounded-xl disabled:opacity-50 transition-colors hover:bg-muted/30"
						>
							Próximo
						</button>
					</div>
				)}
			</section>
		</div>
	);
}
