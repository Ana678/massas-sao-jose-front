import { useState } from "react";
import { DELIVERY_ROUTES, type DayOfWeek, getSkippedClients, toggleSkipClient } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import DaySelector from "@/components/DaySelector";
import QtyAdjuster from "@/components/QtyAdjuster";
import { Plus, X, RotateCcw, Cloud } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useOrdersList } from "@/lib/hooks/useOrders";
import { useProducts } from "@/lib/hooks/useProduct";
import { useClients } from "@/lib/hooks/useClients";
import type { Client } from "@/lib/types";

export default function ProductionPage() {


    const { data: products = [], isLoading: loadingProducts } = useProducts();
    const { data: clients = [], isLoading: loadingClients } = useClients();
    const { data: orders = [], isLoading: loadingOrders } = useOrdersList();

    const getToday = new Date().toLocaleDateString("pt-BR", { weekday: "long" }).replace("-feira", "") as DayOfWeek;

    const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getToday in DELIVERY_ROUTES ? getToday : "segunda");
    const [editedOrders, setEditedOrders] = useState<Record<string, Record<string, number>>>({});
    const [skipped, setSkipped] = useState(getSkippedClients());

    const cities = DELIVERY_ROUTES[selectedDay] || [];
    const allDayClients = clients.filter((c) => cities.includes(c.city));
    const skippedIds = skipped[selectedDay] || [];

    const dayClients = allDayClients.filter(c => !skippedIds.includes(c.id));
    const skippedClients = allDayClients.filter(c => skippedIds.includes(c.id));

    // Get the last order
    const getBaselineOrder = (client: Client) => {
        const clientOrders = orders
            .filter(o => o.clientName === client.name && o.enabled)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const lastOrder = clientOrders[0];
        const base: Record<string, number> = {};

        if (lastOrder) {
            lastOrder.products.forEach(p => {
                base[p.id] = p.quantity; // API usa 'quantity'
            });
        }
        return base;
    };

    function getClientOrder(client: Client): Record<string, number> {
        if (editedOrders[client.id]) return editedOrders[client.id];
        return getBaselineOrder(client);
    }

    const forecast: Record<string, number> = {};
    dayClients.forEach((client) => {
        const order = getClientOrder(client);
        Object.entries(order).forEach(([pid, qty]) => {
            forecast[pid] = (forecast[pid] || 0) + qty;
        });
    });

    const totalUnits = Object.values(forecast).reduce((s, v) => s + v, 0);


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

    function adjustQty(clientId: string, productId: string, delta: number) {
        setEditedOrders((prev) => {
            const client = clients.find((c) => c.id === clientId)!;
            const current = prev[clientId] || getBaselineOrder(client);
            const newQty = Math.max(0, (current[productId] || 0) + delta);
            const updated = { ...current, [productId]: newQty };
            if (updated[productId] === 0) delete updated[productId];
            return { ...prev, [clientId]: updated };
        });
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
            <PageHeader title="Produção" subtitle="Previsão de demanda por dia" />

            <section className="px-6 pb-4">
                <DaySelector value={selectedDay} onChange={(d) => { setSelectedDay(d); setEditedOrders({}); }} />
            </section>

            {/* Summary */}
            <section className="px-6 py-2">
                <div className="border border-border bg-card/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <p className="text-foreground text-sm">
                        Total a Produzir: <span className="font-bold text-primary text-base ml-1">~{totalUnits} un.</span>
                    </p>
                    {Object.keys(editedOrders).length > 0 && (
                        <span className="text-[10px] uppercase tracking-wider bg-accent/10 text-accent px-2 py-1 rounded font-medium">
                            Ajustado Manualmente
                        </span>
                    )}
                </div>
            </section>

            {/* Products forecast */}
            <section className="px-6 py-4">
                <h2 className="font-display text-lg tracking-tight mb-3">Resumo por Produto</h2>
                <div className="grid grid-cols-3 gap-2">
                    {products.map((product) => {
                        const qty = forecast[product.id] || 0;
                        return (
                            <div
                                key={product.id}
                                className={`rounded-xl p-3 text-center border transition-colors ${qty > 0 ? "bg-primary/5 border-primary/30" : "bg-card border-border opacity-60"
                                    }`}
                            >
                                <p className="text-foreground text-[11px] font-medium leading-tight line-clamp-2 min-h-6.5">
                                    {product.name}
                                </p>
                                <p className={`text-xl font-bold mt-1 ${qty > 0 ? "text-primary" : "text-muted-foreground"}`}>
                                    {qty}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* All clients */}
            <section className="px-6 py-4 pb-8">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                        <h2 className="font-display text-lg tracking-tight">Clientes na Rota</h2>
                        <span className="text-muted-foreground text-xs">{dayClients.length} clientes</span>
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
                        const order = getClientOrder(client);
                        const hasNF = client.needFiscalNote || !!(client.socialReason && client.cnpj);
                        const isEdited = !!editedOrders[client.id];

                        return (
                            <div
                                key={client.id}
                                className={`bg-card rounded-xl p-4 border transition-colors ${isEdited ? "border-primary/50 shadow-sm" : "border-border"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-foreground text-sm font-medium">{client.name}</p>
                                        <p className="text-muted-foreground text-[11px] mt-0.5">{client.city}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {hasNF && (
                                            <span className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                                NF
                                            </span>
                                        )}
                                        {isEdited && (
                                            <span
                                                className="text-[9px] uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">
                                                Editado
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleSkip(client.id)}
                                            className="text-destructive/60 hover:text-destructive p-1 rounded transition-colors"
                                            title="Pular cliente hoje"
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
                                                qty={qty}
                                                onAdjust={(delta) => adjustQty(client.id, product.id, delta)}
                                                dimmed={qty === 0}
                                            />
                                        );
                                    })}

                                    {!isEdited && Object.keys(order).length < products.length && (
                                        <button
                                            onClick={() => {
                                                setEditedOrders((prev) => ({
                                                    ...prev,
                                                    [client.id]: { ...order },
                                                }));
                                            }}
                                            className="text-muted-foreground text-xs mt-2 hover:text-foreground transition-colors font-normal w-full border-t pt-2 border-border "
                                        >
                                            <Plus className="w-3 h-3 inline-block mr-1" />
                                            ajustar quantidades
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {dayClients.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">Nenhum cliente na rota deste dia</p>
                    )}
                </div>

                {/* Skipped clients */}
                {skippedClients.length > 0 && (
                    <div className="mt-6">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pulados hoje ({skippedClients.length})</p>
                        <div className="space-y-1.5">
                            {skippedClients.map(c => (
                                <div key={c.id} className="bg-card/50 rounded-lg px-3 py-2 border border-border/50 flex justify-between items-center opacity-60">
                                    <div>
                                        <p className="text-foreground text-sm line-through">{c.name}</p>
                                        <p className="text-muted-foreground text-[11px]">{c.city}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(c.id)}
                                        className="text-primary text-[10px] uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded border border-primary/30 bg-primary/5"
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
