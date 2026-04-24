import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { useOrdersList } from "@/lib/hooks/useOrders";
import { Cloud, SlidersHorizontal, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useClients } from "@/lib/hooks/useClients";

export default function OrdersPage() {
    const { data: orders = [], isLoading } = useOrdersList();
    const { data: clients = [] } = useClients();

    const [paymentFilter, setPaymentFilter] = useState<"todos" | "pago" | "pendente">("todos");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [clientFilter, setClientFilter] = useState("todos");
    const [methodFilter, setMethodFilter] = useState<"todos" | "pix" | "cartao" | "dinheiro">("todos");

    const advancedFiltersCount = [startDate, endDate, clientFilter !== "todos", methodFilter !== "todos"].filter(Boolean).length;

    const filtered = orders
        .filter((o) => {
            if (paymentFilter === "pago") return o.isPaid;
            if (paymentFilter === "pendente") return !o.isPaid;
            return true;
        })
        .filter((o) => !startDate || o.createdAt.slice(0, 10) >= startDate)
        .filter((o) => !endDate || o.createdAt.slice(0, 10) <= endDate)
        .filter((o) => clientFilter === "todos" || o.clientName === clients.find((c) => c.id === clientFilter)?.name)
        .filter((o) => methodFilter === "todos" || o.paymentMethod === methodFilter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const pendingPaymentCount = orders.filter(
        (o) => !o.isPaid
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
            <PageHeader title="Pedidos" subtitle={`${orders.length} encontrados`} backTo="/caixa" />
            <section className="px-6 pb-3">
                <div className="flex gap-2">
                    {([
                        { key: "todos", label: "Todos", count: orders.length },
                        { key: "pendente", label: "Pendentes", count: pendingPaymentCount },
                        { key: "pago", label: "Pagos", count: paidCount },
                    ] as const).map((opt) => {
                        const active = paymentFilter === opt.key;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setPaymentFilter(opt.key)}
                                className={`flex-1 py-2 rounded-xl text-xs font-normal border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                                    }`}
                            >
                                {opt.label}{opt.count > 0 ? ` (${opt.count})` : ""}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="px-6 pb-4">
                <button
                    onClick={() => setShowAdvancedFilters((open) => !open)}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-2.5 text-xs font-normal flex items-center justify-between transition-colors hover:bg-muted/30"
                >
                    <span className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-primary" />
                        Filtros detalhados
                    </span>
                    <span className="text-muted-foreground">{advancedFiltersCount > 0 ? `${advancedFiltersCount} ativo${advancedFiltersCount > 1 ? "s" : ""}` : "Período, cliente e pagamento"}</span>
                </button>

                {showAdvancedFilters && (
                    <div className="mt-3 bg-card rounded-xl border border-border p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <label className="space-y-1 text-[11px] text-muted-foreground">
                                Início
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
                                />
                            </label>
                            <label className="space-y-1 text-[11px] text-muted-foreground">
                                Fim
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
                                />
                            </label>
                        </div>

                        <label className="space-y-1 text-[11px] text-muted-foreground block">
                            Cliente
                            <select
                                value={clientFilter}
                                onChange={(e) => setClientFilter(e.target.value)}
                                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
                            >
                                <option value="todos">Todos os clientes</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1 text-[11px] text-muted-foreground block">
                            Forma de pagamento
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
                                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs text-foreground"
                            >
                                <option value="todos">Todas as formas</option>
                                <option value="pix">Pix</option>
                                <option value="cartao">Cartão</option>
                                <option value="dinheiro">Dinheiro</option>
                            </select>
                        </label>

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
                )}
            </section>

            <section className="px-6 pb-6 space-y-2">
                {/* 3. Estado de Carregamento */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                        <Cloud className="w-8 h-8 animate-pulse text-primary" />
                        <p className="text-sm">Buscando histórico...</p>
                    </div>
                )}

                {!isLoading && filtered.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">Nenhum pedido encontrado</p>
                )}

                {!isLoading && filtered.map((order) => (
                    <Link
                        key={order.id}
                        to="/order/edit"
                        search={{ id: order.id }}
                    >
                        <div key={order.id} className={`mt-3 bg-card rounded-xl p-4 border transition-colors ${order.enabled ? 'border-border' : 'border-destructive/30 opacity-70'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-foreground text-sm font-normal">{order.clientName}</p>
                                    <p className="text-muted-foreground text-xs mt-0.5">
                                        {new Date(order.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                                {!order.enabled && (
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive`}>
                                            Cancelado
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-0.5">
                                {order.products?.map((i) => (
                                    <p key={i.id} className="text-muted-foreground text-xs flex justify-between">
                                        <span>{i.quantity}x {i.name}</span>
                                    </p>
                                ))}
                            </div>

                            {(order.enabled) && (

                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full align-middle ${order.isPaid
                                            ? "bg-primary/10 text-primary"
                                            : "bg-destructive/10 text-destructive"
                                            }`}>
                                            {order.isPaid ? order.paymentMethod + ' • Pago' : order.paymentMethod + ' • Não Pago'}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-normal ${order.isPaid ? 'text-primary' : 'text-destructive'}`}>
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))
                }
            </section >
        </div >
    );
}
