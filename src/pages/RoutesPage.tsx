import { useState } from "react";
import { CheckCircle, Cloud, FileText, Download, Calendar, X, Plus, RotateCcw } from "lucide-react";
import ItemBreakdown from "@/components/ItemBreakdown";
import QtyAdjuster from "@/components/QtyAdjuster";
import AddressLink from "@/components/AddressLink";
import PhoneButton from "@/components/PhoneButton";
import {
    getClients, getProducts, getOrders, saveOrders, generateId, getTodayRoute,
    getTodayDayName, formatCurrency, clientNeedsInvoice, getRouteOverrides, saveRouteOverrides,
    getSkippedClients, toggleSkipClient,
    ALL_CITIES, type Client, type Order
} from "@/lib/data";
import { toast } from "sonner";
import LogoImg from "@/assets/logo.svg";
import { Link } from '@tanstack/react-router';

export default function RoutesPage() {
    const [products] = useState(getProducts());
    const [orders, setOrders] = useState<Order[]>(getOrders());
    const [delivered, setDelivered] = useState<Record<string, boolean>>({});
    const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>(() => {

        const all = getClients();
        const initialRoute = getTodayRoute();
        const routeClients = all.filter((c) => initialRoute.includes(c.cidade));
        const q: Record<string, Record<string, number>> = {};
        routeClients.forEach((c) => {
            if (c.averageOrder) q[c.id] = { ...c.averageOrder };
        });
        return q;
    });
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [overrideDate, setOverrideDate] = useState("");
    const [overrideCities, setOverrideCities] = useState<string[]>([]);
    const [overrideReason, setOverrideReason] = useState("");
    const [skipped, setSkipped] = useState(getSkippedClients());
    const todayRoute = getTodayRoute();
    const allClients = getClients();
    const clients = allClients.filter((c) => todayRoute.includes(c.cidade));

    const todayCities = todayRoute.join(", ");
    const todayStr = new Date().toISOString().slice(0, 10);
    const overrides = getRouteOverrides();
    const hasOverride = overrides.some((o) => o.date === todayStr);

    const skipKey = todayStr;
    const skippedIds = skipped[skipKey] || [];

    function handleSkipClient(clientId: string) {
        const updated = toggleSkipClient(skipKey, clientId);
        setSkipped({ ...updated });
        toast.success("Cliente pulado hoje");
    }

    function handleRestoreClient(clientId: string) {
        const updated = toggleSkipClient(skipKey, clientId);
        setSkipped({ ...updated });
        toast.success("Cliente restaurado na rota");
    }

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const todayRevenue = todayOrders
        .filter((o) => o.status === "concluido")
        .reduce((s, o) => s + o.total, 0);

    const pending = clients.filter((c) => !delivered[c.id]);
    const done = clients.filter((c) => delivered[c.id]);

    function adjustQty(clientId: string, productId: string, delta: number) {
        setQuantities((prev) => {
            const c = { ...(prev[clientId] || {}) };
            c[productId] = Math.max(0, (c[productId] || 0) + delta);
            return { ...prev, [clientId]: c };
        });
    }

    function markDelivered(client: Client) {
        const clientQty = quantities[client.id] || {};
        const items = Object.entries(clientQty)
            .filter(([, q]) => q > 0)
            .map(([pid, q]) => {
                const p = products.find((x) => x.id === pid);
                return { productId: pid, productName: p?.name || "", qty: q, unitPrice: p?.sellPrice || 0 };
            });
        if (items.length === 0) return;

        const order: Order = {
            id: generateId(),
            clientId: client.id,
            clientName: client.name,
            items,
            total: items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
            paymentMethod: "dinheiro",
            status: "concluido",
            createdAt: new Date().toISOString(),
            isPreOrder: false,
        };
        const updated = [...orders, order];
        setOrders(updated);
        saveOrders(updated);
        setDelivered((prev) => ({ ...prev, [client.id]: true }));
    }

    function saveOverride() {
        if (!overrideDate || overrideCities.length === 0) {
            toast.error("Preencha a data e selecione ao menos uma cidade");
            return;
        }
        const existing = overrides.filter((o) => o.date !== overrideDate);
        const newOverride = { id: generateId(), date: overrideDate, cities: overrideCities, reason: overrideReason };
        saveRouteOverrides([...existing, newOverride]);
        setShowOverrideModal(false);
        setOverrideDate("");
        setOverrideCities([]);
        setOverrideReason("");
        toast.success("Rota alterada para " + new Date(overrideDate + "T12:00").toLocaleDateString("pt-BR"));
    }

    function toggleOverrideCity(city: string) {
        setOverrideCities((prev) =>
            prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
        );
    }
    const skippedClientsList = clients.filter(c => skippedIds.includes(c.id));

    return (
        <>
            {/* Header */}
            <header className="flex justify-between items-start px-6 pt-8 pb-4">
                <div className="font-display leading-[1.1] tracking-tighter text-xl">
                    <img
                        src={LogoImg}
                        alt="Logo da minha aplicação"
                        className="h-10 w-auto"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowOverrideModal(true)}
                        className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        Alterar rota
                    </button>
                    <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full border border-border">
                        <Cloud className="w-4 h-4 text-primary" />
                        <span className="text-xs text-primary tracking-wide font-normal">Sync</span>
                    </div>
                </div>
            </header>

            {/* Greeting */}
            <section className="px-6 pt-2 pb-4">
                <h1 className="font-display text-3xl tracking-tight leading-tight">
                    {getTodayDayName()}, <br />
                    <span className="text-base">rota para </span>
                    <span className="italic text-base">{todayCities}.</span>
                </h1>
                {hasOverride && (
                    <p className="text-accent text-xs mt-1">⚠️ Rota alterada para hoje</p>
                )}
            </section>

            {/* Quick stats */}
            <section className="px-6 py-2">
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1.5">Vendido hoje</p>
                    <p className="text-primary text-4xl tracking-tighter font-normal">{formatCurrency(todayRevenue)}</p>
                    <div className="border-t border-border mt-5 pt-5 flex justify-between items-center">
                        <div>
                            <p className="text-muted-foreground text-xs mb-1 tracking-wide">Pedidos</p>
                            <p className="text-foreground text-sm font-normal">{todayOrders.length}</p>
                        </div>
                        <div className="w-px h-8 bg-border"></div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-xs mb-1 tracking-wide">Visitas</p>
                            <p className="text-foreground text-sm font-normal">{done.length}/{clients.length}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick sale */}
            <section className="px-6 py-4">
                <Link
                    to="/order/new"
                    search={{ dia: undefined }}
                >
                    <button
                        className="w-full bg-accent text-accent-foreground rounded-2xl p-4 flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-sm"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="text-base tracking-wide font-normal">Realizar Venda</span>
                    </button>

                </Link>
            </section>

            {/* Route */}
            <section className="px-6 pt-2 flex-grow">
                <div className="flex justify-between items-end mb-3">
                    <h2 className="font-display text-lg tracking-tight">Rota de Hoje</h2>
                    <span className="text-muted-foreground text-xs">{pending.length} visitas restantes</span>
                </div>
                <div className="space-y-3">
                    {pending.map((client) => {
                        const clientQty = quantities[client.id] || {};
                        const hasNF = clientNeedsInvoice(client);

                        return (
                            <div key={client.id} className="bg-card rounded-xl p-4 flex flex-col gap-3 border border-border animate-slide-up">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-accent shrink-0"></div>
                                                <p className="text-foreground text-sm font-medium truncate">{client.name}</p>
                                                {hasNF && (
                                                    <span className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                                                        NF
                                                    </span>
                                                )}
                                            </div>
                                            <AddressLink client={client} className="mt-1" />
                                        </div>
                                    </div>
                                    <PhoneButton phone={client.phone} />
                                </div>

                                {/* Item breakdown */}
                                <ItemBreakdown quantities={clientQty} products={products} />

                                {/* Quantity adjusters */}
                                <div className="space-y-1">
                                    {Object.entries(clientQty).filter(([, q]) => q > 0).map(([pid, qty]) => {
                                        const p = products.find((x) => x.id === pid);
                                        if (!p) return null;
                                        return (
                                            <QtyAdjuster
                                                key={pid}
                                                label={p.name}
                                                icon={p.icon}
                                                qty={qty}
                                                onAdjust={(delta) => adjustQty(client.id, pid, delta)}
                                            />
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        {hasNF ? (
                                            <button className="text-primary text-[11px] flex items-center gap-1 hover:underline">
                                                <FileText className="w-3.5 h-3.5" />
                                                Gerar NF
                                            </button>
                                        ) : <div />}
                                        <button
                                            onClick={() => handleSkipClient(client.id)}
                                            className="text-destructive/60 hover:text-destructive text-[11px] flex items-center gap-1 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            Pular
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => markDelivered(client)}
                                        className="text-primary-foreground text-xs bg-primary px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Entregue
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {done.map((client) => {
                        const hasNF = clientNeedsInvoice(client);
                        return (
                            <div key={client.id} className="bg-background rounded-xl p-4 border border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        <div>
                                            <p className="text-foreground text-sm line-through decoration-muted-foreground font-normal">{client.name}</p>
                                            <p className="text-primary text-xs mt-0.5">Entregue ✓</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasNF && (
                                            <button className="text-primary hover:bg-primary/10 p-1.5 rounded transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                        <CheckCircle className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Skipped clients */}
                    {skippedClientsList.length > 0 && (
                        <div className="mt-4">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pulados hoje ({skippedClientsList.length})</p>
                            {skippedClientsList.map(c => (
                                <div key={c.id} className="bg-card/50 rounded-lg px-3 py-2 border border-border/50 flex justify-between items-center opacity-60 mb-1.5">
                                    <div>
                                        <p className="text-foreground text-sm line-through">{c.name}</p>
                                        <p className="text-muted-foreground text-[11px]">{c.cidade}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRestoreClient(c.id)}
                                        className="text-primary text-[10px] uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded border border-primary/30 bg-primary/5"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Restaurar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {clients.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Nenhum cliente na rota de hoje
                        </div>
                    )}
                </div>
            </section>

            {/* Route Override Modal */}
            {showOverrideModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center">
                    <div className="w-full max-w-md bg-background rounded-t-2xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="font-display text-lg">Alterar Rota (Feriado)</h3>
                            <button onClick={() => setShowOverrideModal(false)}>
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4 space-y-4">
                            <div>
                                <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">Data</label>
                                <input
                                    type="date"
                                    value={overrideDate}
                                    onChange={(e) => setOverrideDate(e.target.value)}
                                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div>
                                <label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">Cidades para este dia</label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_CITIES.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => toggleOverrideCity(city)}
                                            className={`px-3 py-2 rounded-xl text-xs border transition-colors ${overrideCities.includes(city)
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-card text-foreground border-border"
                                                }`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">Motivo (opcional)</label>
                                <input
                                    type="text"
                                    value={overrideReason}
                                    onChange={(e) => setOverrideReason(e.target.value)}
                                    placeholder="Ex: Feriado municipal"
                                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>

                            {/* Existing overrides */}
                            {overrides.length > 0 && (
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Alterações agendadas</p>
                                    {overrides.map((o) => (
                                        <div key={o.id} className="bg-card rounded-xl p-3 border border-border mb-2 flex justify-between items-center">
                                            <div>
                                                <p className="text-foreground text-sm">{new Date(o.date + "T12:00").toLocaleDateString("pt-BR")}</p>
                                                <p className="text-muted-foreground text-xs">{o.cities.join(", ")}</p>
                                                {o.reason && <p className="text-accent text-xs mt-0.5">{o.reason}</p>}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    saveRouteOverrides(overrides.filter((x) => x.id !== o.id));
                                                    toast.success("Alteração removida");
                                                }}
                                                className="text-destructive p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-border">
                            <button
                                onClick={saveOverride}
                                disabled={!overrideDate || overrideCities.length === 0}
                                className="w-full bg-primary text-primary-foreground rounded-xl p-3.5 font-normal disabled:opacity-50 transition-transform active:scale-[0.98]"
                            >
                                Salvar Alteração
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
