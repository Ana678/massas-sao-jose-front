import { useState } from "react";
import { getClients, getProducts, saveClients, type Client, DELIVERY_ROUTES, type DayOfWeek, getSkippedClients, toggleSkipClient } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import DaySelector from "@/components/DaySelector";
import QtyAdjuster from "@/components/QtyAdjuster";
import { Save, Plus, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export default function ProductionPage() {
    const [products] = useState(getProducts());
    const [clients, setClients] = useState(getClients());
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>("quinta");
    const [editedOrders, setEditedOrders] = useState<Record<string, Record<string, number>>>({});
    const [skipped, setSkipped] = useState(getSkippedClients());

    const cities = DELIVERY_ROUTES[selectedDay] || [];
    const allDayClients = clients.filter((c) => cities.includes(c.cidade));
    const skippedIds = skipped[selectedDay] || [];
    const dayClients = allDayClients.filter(c => !skippedIds.includes(c.id));
    const skippedClients = allDayClients.filter(c => skippedIds.includes(c.id));

    function handleSkip(clientId: string) {
        const updated = toggleSkipClient(selectedDay, clientId);
        setSkipped({ ...updated });
        toast.success("Cliente removido da rota de hoje");
    }

    function handleRestore(clientId: string) {

        const updated = toggleSkipClient(selectedDay, clientId);
        setSkipped({ ...updated });
        toast.success("Cliente restaurado na rota");
    }
    function getClientOrder(client: Client): Record<string, number> {
        if (editedOrders[client.id]) return editedOrders[client.id];
        return client.averageOrder || {};
    }

    const forecast: Record<string, number> = {};
    dayClients.forEach((c) => {
        const order = getClientOrder(c);
        Object.entries(order).forEach(([pid, qty]) => {
            forecast[pid] = (forecast[pid] || 0) + qty;
        });
    });

    const totalUnits = Object.values(forecast).reduce((s, v) => s + v, 0);

    function adjustQty(clientId: string, productId: string, delta: number) {
        setEditedOrders((prev) => {
            const client = clients.find((c) => c.id === clientId);
            const current = prev[clientId] || client?.averageOrder || {};
            const newQty = Math.max(0, (current[productId] || 0) + delta);
            const updated = { ...current, [productId]: newQty };
            if (updated[productId] === 0) delete updated[productId];
            return { ...prev, [clientId]: updated };
        });
    }

    function saveAllEdits() {
        const updatedClients = clients.map((c) => {
            if (editedOrders[c.id]) {
                return { ...c, averageOrder: editedOrders[c.id] };
            }
            return c;
        });
        saveClients(updatedClients);
        setClients(updatedClients);
        setEditedOrders({});
        toast.success("Médias de pedidos atualizadas!");
    }

    const hasEdits = Object.keys(editedOrders).length > 0;



    return (
        <>
            <PageHeader title="Produção" subtitle="Previsão de demanda por dia" />

            <section className="px-6 pb-4">
                <DaySelector value={selectedDay} onChange={(d) => { setSelectedDay(d); setEditedOrders({}); }} />
            </section>

            {/* Summary */}
            <section className="px-6 py-2">
                <div className="border border-border bg-card/60 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-foreground text-xs">
                        Previsão: <span className="font-medium">~{totalUnits} unidades</span>
                    </p>
                    <div className="flex items-center gap-2">
                        {hasEdits && (
                            <button
                                onClick={saveAllEdits}
                                className="text-primary text-[10px] uppercase tracking-wider border border-primary/30 bg-background px-2 py-1 rounded font-normal flex items-center gap-1"
                            >
                                <Save className="w-3 h-3" />
                                Salvar
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Products forecast */}
            <section className="px-6 py-2">
                <h2 className="font-display text-lg tracking-tight mb-3">Itens para Produzir</h2>
                <div className="grid grid-cols-3 gap-2">
                    {products.map((product) => {
                        const qty = forecast[product.id] || 0;
                        return (
                            <div
                                key={product.id}
                                className={`rounded-xl p-3 text-center border transition-colors ${qty > 0 ? "bg-primary/10 border-primary/30" : "bg-card border-border"
                                    }`}
                            >
                                <span className="text-xl block">{product.icon}</span>
                                <p className="text-foreground text-[11px] font-normal mt-1 leading-tight">{product.name}</p>
                                <p className={`text-lg font-medium mt-1 ${qty > 0 ? "text-primary" : "text-muted-foreground"}`}>
                                    {qty}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* All clients */}
            <section className="px-6 py-4 pb-8">
                <div className="flex justify-between items-end mb-3">
                    <h2 className="font-display text-lg tracking-tight">Clientes na Rota</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">{dayClients.length} clientes</span>
                        <Link to="/order/new"
                            search={{ dia: selectedDay }}>
                            <button
                                className="bg-primary text-primary-foreground rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider font-normal flex items-center gap-1 active:scale-95 transition-transform"
                            >
                                <Plus className="w-3 h-3" />
                                Pedido
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="space-y-3">
                    {dayClients.map((client) => {
                        const order = getClientOrder(client);
                        const isEdited = !!editedOrders[client.id];
                        const hasNF = client.needsInvoice || !!(client.razaoSocial && client.cpfCnpj?.includes("/"));

                        return (
                            <div
                                key={client.id}
                                className={`bg-card rounded-xl p-4 border transition-colors ${isEdited ? "border-primary/50" : "border-border"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-foreground text-sm font-medium">{client.name}</p>
                                        <p className="text-muted-foreground text-[11px] mt-0.5">{client.cidade}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {hasNF && (
                                            <span className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                                NF
                                            </span>
                                        )}
                                        {isEdited && (
                                            <span className="text-[9px] uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">
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
                                                icon={product.icon}
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
                                            className="text-muted-foreground text-[11px] mt-1 hover:text-foreground transition-colors"
                                        >
                                            + adicionar itens
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {dayClients.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">Nenhum cliente na rota deste dia</p>
                    )}
                </div>

                {/* Skipped clients */}
                {skippedClients.length > 0 && (
                    <div className="mt-4">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pulados hoje ({skippedClients.length})</p>
                        <div className="space-y-1.5">
                            {skippedClients.map(c => (
                                <div key={c.id} className="bg-card/50 rounded-lg px-3 py-2 border border-border/50 flex justify-between items-center opacity-60">
                                    <div>
                                        <p className="text-foreground text-sm line-through">{c.name}</p>
                                        <p className="text-muted-foreground text-[11px]">{c.cidade}</p>
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
        </>
    );
}

