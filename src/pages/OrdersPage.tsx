import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getOrders, formatCurrency } from "@/lib/data";

const STATUS_LABELS: Record<string, string> = {
    preparando: "Preparando",
    saiu_entrega: "Saiu p/ Entrega",
    concluido: "Concluído",
    cancelado: "Cancelado",
    pendente_sync: "Pendente Sync",
};

export default function OrdersPage() {
    const [orders] = useState(getOrders());
    const [filter, setFilter] = useState<"hoje" | "semana" | "mes">("hoje");

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = now.toISOString().slice(0, 7);

    const filtered = orders.filter((o) => {
        if (filter === "hoje") return o.createdAt.startsWith(today);
        if (filter === "semana") return o.createdAt >= weekAgo;
        return o.createdAt.startsWith(monthStart);
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return (
        <>
            <PageHeader title="Pedidos" subtitle={`${filtered.length} encontrados`} backTo="/caixa" />

            <section className="px-6 pb-4">
                <div className="flex gap-2">
                    {(["hoje", "semana", "mes"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-2 rounded-xl text-xs font-normal border transition-colors ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                                }`}
                        >
                            {f === "hoje" ? "Hoje" : f === "semana" ? "Semana" : "Mês"}
                        </button>
                    ))}
                </div>
            </section>

            <section className="px-6 pb-6 space-y-2">
                {filtered.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">Nenhum pedido encontrado</p>
                )}
                {filtered.map((o) => (
                    <div key={o.id} className="bg-card rounded-xl p-4 border border-border">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-foreground text-sm font-normal">{o.clientName}</p>
                                <p className="text-muted-foreground text-xs mt-0.5">
                                    {new Date(o.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "concluido" ? "bg-primary/10 text-primary"
                                    : o.status === "cancelado" ? "bg-accent/10 text-accent"
                                        : "bg-muted text-muted-foreground"
                                    }`}>
                                    {STATUS_LABELS[o.status]}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            {o.items.map((i, idx) => (
                                <p key={idx} className="text-muted-foreground text-xs">
                                    {i.qty}x {i.productName}
                                </p>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                            <span className="text-muted-foreground text-xs capitalize">{o.paymentMethod}</span>
                            <span className="text-primary text-sm font-normal">{formatCurrency(o.total)}</span>
                        </div>
                    </div>
                ))}
            </section>
        </>
    );
}
