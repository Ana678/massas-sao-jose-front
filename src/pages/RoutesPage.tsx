import { useEffect, useState } from "react";
import { CheckCircle, Cloud, FileText, Download, Calendar, X, Plus, RotateCcw, AlertCircle } from "lucide-react";
import ItemBreakdown from "@/components/ItemBreakdown";
import QtyAdjuster from "@/components/QtyAdjuster";
import AddressLink from "@/components/AddressLink";
import PhoneButton from "@/components/PhoneButton";
import { toast } from "sonner";
import Logo from "@/assets/logo.svg?react";
import { Link } from '@tanstack/react-router';
import { type Client, type Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

import { getCitiesForToday } from "@/lib/utils";
import { useClients } from "@/lib/hooks/useClients";
import { useProducts } from "@/lib/hooks/useProduct";
import { useOrdersList, useCreateOrder } from "@/lib/hooks/useOrders";
import {
    generateId, getRouteOverrides, saveRouteOverrides,
    getSkippedClients, toggleSkipClient, ALL_CITIES
} from "@/lib/data";
import PaymentSelector from "@/components/PaymentSelector";

export default function RoutesPage() {
    const { data: allClients = [], isLoading: loadingClients } = useClients();
    const { data: products = [], isLoading: loadingProducts } = useProducts();
    const { data: orders = [], isLoading: loadingOrders } = useOrdersList();
    const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();


    const [delivered, setDelivered] = useState<Record<string, boolean>>({});
    const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});


    const [deliveryClient, setDeliveryClient] = useState<Client | null>(null);
    const [deliveryPaid, setDeliveryPaid] = useState(true);
    const [deliveryPayment, setDeliveryPayment] = useState<Order["paymentMethod"]>("dinheiro");

    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [overrideDate, setOverrideDate] = useState("");
    const [overrideCities, setOverrideCities] = useState<string[]>([]);
    const [overrideReason, setOverrideReason] = useState("");
    const [skipped, setSkipped] = useState(getSkippedClients());
    const [hasInitialized, setHasInitialized] = useState(false);


    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const overrides = getRouteOverrides();
    const hasOverride = overrides.some((o) => o.date === todayStr);
    const todayCities = getCitiesForToday(today, overrides);
    const routeClients = allClients.filter((c) => todayCities.includes(c.city));
    const skipKey = todayStr;
    const skippedIds = skipped[skipKey] || [];

    useEffect(() => {

        if (hasInitialized || allClients.length === 0 || orders.length === 0) return;

        if (routeClients.length === 0) return;

        const initialQuantities: Record<string, Record<string, number>> = {};

        routeClients.forEach(client => {
            const clientOrders = orders
                .filter(o => o.clientName === client.name && o.enabled)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const lastOrder = clientOrders[0];

            if (lastOrder) {
                initialQuantities[client.id] = {};
                lastOrder.products.forEach(p => {
                    initialQuantities[client.id][p.id] = p.quantity;
                });
            }
        });

        setQuantities(initialQuantities);
        setHasInitialized(true);

    }, [allClients.length, orders.length, routeClients.length, hasInitialized]);

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

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr) && o.enabled);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    const checkIfDeliveredToday = (client: Client) => {
        if (delivered[client.id]) return true;

        const hasOrderInDb = orders.some(o =>
            o.clientName === client.name &&
            o.createdAt.startsWith(todayStr) &&
            o.isPaid &&
            o.enabled
        );

        return hasOrderInDb;
    };

    const pending = routeClients.filter((c) => !checkIfDeliveredToday(c) && !skippedIds.includes(c.id));
    const done = routeClients.filter((c) => checkIfDeliveredToday(c));

    const skippedClientsList = routeClients.filter(c => skippedIds.includes(c.id));

    function adjustQty(clientId: string, productId: string, delta: number) {
        setQuantities((prev) => {
            const c = { ...(prev[clientId] || {}) };
            c[productId] = Math.max(0, (c[productId] || 0) + delta);
            return { ...prev, [clientId]: c };
        });
    }

    const unpaidOrders = orders.filter((o) => !o.isPaid);

    function markDelivered(client: Client) {
        const clientQty = quantities[client.id] || {};
        const items = Object.entries(clientQty)
            .filter(([, q]) => q > 0)
            .map(([pid, q]) => ({ productId: pid, quantity: q }));

        if (items.length === 0) {
            toast.error("Adicione itens para concluir a entrega");
            return;
        }
        createOrder({
            clientId: client.id,
            products: items,
            paymentMethod: deliveryPayment,
            isPaid: deliveryPaid,

        }, {
            onSuccess: () => {
                setDelivered((prev) => ({ ...prev, [client.id]: true }));
                setDeliveryClient(null);
                toast.success("Entrega salva no sistema!");
            }
        });
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

    const isLoading = loadingClients || loadingProducts || loadingOrders;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                <Cloud className="w-8 h-8 animate-pulse text-primary" />
                <p>Montando rota do dia...</p>
            </div>
        );
    }
    return (
        <>
            {/* Header */}
            <header className="flex justify-between items-start px-6 pt-8 pb-4">
                <div className="font-display leading-[1.1] tracking-tighter text-xl">
                    <Logo className="h-10 w-auto object-contain" />
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
                        <span className="text-xs text-primary tracking-wide font-normal">Sync Ok</span>
                    </div>
                </div>
            </header>

            {/* Greeting */}
            <section className="px-6 pt-2 pb-4">
                <h1 className="font-display text-3xl tracking-tight leading-tight">
                    {today.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')}, <br />
                    <span className="text-base">rota para </span>
                    <span className="italic text-base">{todayCities.join(", ") || "nenhuma cidade"}.</span>
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
                            <p className="text-foreground text-sm font-normal">{done.length}/{routeClients.length}</p>
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
                {unpaidOrders.length > 0 && (
                    <Link
                        to="/orders"
                        search={{ dia: undefined }}
                    >
                        <button
                            className="w-full mt-3 bg-card text-foreground border border-border rounded-2xl p-4 flex items-center justify-between gap-3 transition-transform active:scale-[0.98] shadow-sm"
                        >
                            <span className="flex items-center gap-2 text-sm">
                                <AlertCircle className="w-5 h-5 text-accent" />
                                Pedidos não pagos
                            </span>
                            <span className="text-primary text-sm font-medium">{unpaidOrders.length}</span>
                        </button>
                    </Link>
                )}
            </section>

            {/* Route */}
            <section className="px-6 pt-2 grow pb-24">
                <div className="flex justify-between items-end mb-3">
                    <h2 className="font-display text-lg tracking-tight">Rota de Hoje</h2>
                    <span className="text-muted-foreground text-xs">{pending.length} visitas restantes</span>
                </div>
                <div className="space-y-3">
                    {pending.map((client) => {
                        const clientQty = quantities[client.id] || {};
                        const hasNF = client.needFiscalNote || !!(client.socialReason && client.cnpj);

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

                                    {products.map((p) => {
                                        const qty = clientQty[p.id] || 0;
                                        return (
                                            <QtyAdjuster
                                                key={p.id}
                                                label={p.name}
                                                qty={qty}
                                                onAdjust={(delta) => adjustQty(client.id, p.id, delta)}
                                            />
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        {hasNF && (
                                            <button className="text-primary text-[11px] flex items-center gap-1 hover:underline">
                                                <FileText className="w-3.5 h-3.5" />
                                                Gerar NF
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSkipClient(client.id)}
                                            className="text-destructive/60 hover:text-destructive text-[11px] flex items-center gap-1 transition-colors ml-2"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            Pular
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setDeliveryClient(client)}

                                        //onClick={() => markDelivered(client)}
                                        disabled={isCreatingOrder}
                                        className="text-primary-foreground text-xs bg-primary px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {isCreatingOrder ? "Salvando..." : "Entregue"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {done.map((client) => {
                        return (
                            <div key={client.id} className="bg-primary/5 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3.5">

                                        <div>
                                            <p className="text-foreground text-sm line-through decoration-muted-foreground decoration-1 font-normal">{client.name}</p>
                                            <p className="text-primary text-xs mt-0.5 align-middle flex items-center gap-2">
                                                <CheckCircle className="w-3 h-3 text-primary/80" />
                                                Pedido Entregue •
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {true && (
                                            <button className="text-primary bg-primary/10 hover:bg-primary/20 p-1.5 rounded-xl transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {skippedClientsList.length > 0 && (
                        <div className="mt-4 border-t border-border/50 pt-4">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pulados hoje ({skippedClientsList.length})</p>
                            {skippedClientsList.map(c => (
                                <div key={c.id} className="bg-card/50 rounded-lg px-3 py-2 border border-border/50 flex justify-between items-center opacity-60 mb-1.5">
                                    <div>
                                        <p className="text-foreground text-sm line-through">{c.name}</p>
                                        <p className="text-muted-foreground text-[11px]">{c.city}</p>
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

                    {routeClients.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Nenhum cliente na rota de hoje
                        </div>
                    )}
                </div>
            </section>

            {deliveryClient && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="w-full max-w-md bg-background rounded-t-2xl py-4 space-y-4">

                        <div className="flex items-start justify-between gap-3 px-4">
                            <div>
                                <h3 className="font-display text-xl leading-tight mt-1">{deliveryClient.name}</h3>
                                <p className="text-muted-foreground text-xs uppercase tracking-widest pt-1">Finalizar entrega</p>
                            </div>
                            <button onClick={() => setDeliveryClient(null)} aria-label="Fechar">
                                <X className="w-5 h-5 text-muted-foreground cursor-pointer" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 px-4">
                            <button
                                onClick={() => setDeliveryPaid(true)}
                                className={`rounded-xl border py-3 text-xs transition-colors font-normal
                                    ${deliveryPaid ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
                            >
                                Já pagou
                            </button>
                            <button
                                onClick={() => setDeliveryPaid(false)}
                                className={`rounded-xl border py-3 text-xs transition-colors font-normal
                                    ${!deliveryPaid ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
                            >
                                Ficou pendente
                            </button>
                        </div>

                        {
                            deliveryPaid && (
                                <section className="flex flex-col gap-2 px-4">
                                    <label className="text-muted-foreground text-xs uppercase tracking-widest mt-2">Forma de Pagamento</label>
                                    <PaymentSelector value={deliveryPayment as "pix" | "cartao" | "dinheiro"} onChange={setDeliveryPayment} />
                                </section>

                            )
                        }

                        <div className="p-4 pb-0 border-t border-border">
                            <button
                                onClick={() => markDelivered(deliveryClient)}
                                className="w-full bg-primary text-primary-foreground rounded-xl p-3.5 font-normal disabled:opacity-50 transition-transform active:scale-[0.98]"
                            >
                                Confirmar entrega
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showOverrideModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
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
