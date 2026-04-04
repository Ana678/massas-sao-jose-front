import { useState, useMemo } from "react";
import { Check, ChevronDown, X, Sparkles, Calendar, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ProductGrid from "@/components/ProductGrid";
import PaymentSelector from "@/components/PaymentSelector";
import {
    getProducts, getClients, getOrders, saveOrders, generateId,
    formatCurrency, type Order, type OrderItem, type Client,
    DELIVERY_ROUTES, type DayOfWeek,
} from "@/lib/data";
import { useSearch } from "@tanstack/react-router";


export default function NewOrderPage() {

    const { dia } = useSearch({ from: '/_authenticated/order/new' });
    const dayParam = dia as DayOfWeek | null;

    const [products] = useState(getProducts());
    const [clients] = useState(getClients());
    const [selectedClient, setSelectedClient] = useState("");
    const [cart, setCart] = useState<Record<string, number>>({});
    const [payment, setPayment] = useState<"pix" | "cartao" | "dinheiro">("dinheiro");
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCity, setFilterCity] = useState<string>(
        dayParam ? "" : ""
    );
    // Cities relevant to the day param
    const dayCities = dayParam ? (DELIVERY_ROUTES[dayParam] || []) : [];

    const selectedClientData = useMemo(
        () => clients.find((c) => c.id === selectedClient),
        [clients, selectedClient]
    );
    const filteredClients = useMemo(() => {
        let list = clients;
        if (filterCity) {
            list = list.filter(c => c.cidade === filterCity);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q) || c.cidade.toLowerCase().includes(q));
        }
        return list;
    }, [clients, filterCity, searchQuery]);

    // Unique cities from clients
    const availableCities = useMemo(() => {
        const set = new Set(clients.map(c => c.cidade));
        return Array.from(set).sort();
    }, [clients]);
    function selectClient(client: Client) {
        setSelectedClient(client.id);
        setShowClientPicker(false);
        setSearchQuery("");
    }

    function loadPredictiveOrder(client: Client) {
        if (client.averageOrder && Object.keys(client.averageOrder).length > 0) {
            setCart({ ...client.averageOrder });
        }
    }

    function tapProduct(pid: string) {
        setCart((prev) => ({ ...prev, [pid]: (prev[pid] || 0) + 1 }));
    }

    function adjustQty(pid: string, delta: number) {
        setCart((prev) => {
            const q = Math.max(0, (prev[pid] || 0) + delta);
            const next = { ...prev };
            if (q === 0) delete next[pid];
            else next[pid] = q;
            return next;
        });
    }

    const items: OrderItem[] = Object.entries(cart).map(([pid, qty]) => {
        const p = products.find((x) => x.id === pid)!;
        return { productId: pid, productName: p.name, qty, unitPrice: p.sellPrice };
    });
    const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const totalItems = items.reduce((s, i) => s + i.qty, 0);

    function submit() {

        if (!selectedClient || items.length === 0) return;
        const client = clients.find((c) => c.id === selectedClient)!;
        const order: Order = {
            id: generateId(),
            clientId: client.id,
            clientName: client.name,
            items,
            total,
            paymentMethod: payment,
            status: "preparando",
            createdAt: new Date().toISOString(),
            isPreOrder: true,
        };
        const all = [...getOrders(), order];
        saveOrders(all);
    }

    return (
        <div className="flex flex-col h-full min-h-screen pb-44">
            <PageHeader title="Novo Pedido" backTo="/" />
            {dayParam && (
                <section className="px-4 pb-2">
                    <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 text-xs text-primary">
                        <Calendar />
                        Pedido para rota de <span className="font-medium capitalize">{dayParam}</span>
                        {dayCities.length > 0 && ` — ${dayCities.join(', ')}`}
                    </div>
                </section>
            )}
            {/* Client selector */}
            <section className="px-4 pb-3">
                <button
                    onClick={() => setShowClientPicker(true)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between text-sm"
                >
                    <span className={selectedClientData ? "text-foreground" : "text-muted-foreground"}>
                        {selectedClientData ? `${selectedClientData.name} — ${selectedClientData.cidade}` : "Selecionar cliente..."}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {selectedClientData?.averageOrder && Object.keys(selectedClientData.averageOrder).length > 0 && Object.keys(cart).length === 0 && (
                    <button
                        onClick={() => loadPredictiveOrder(selectedClientData)}
                        className="w-full mt-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-primary transition-transform active:scale-[0.98]"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Carregar pedido padrão desse cliente</span>
                    </button>
                )}
            </section>

            {/* Pre-order toggle
            <section className="px-4 pb-3">
                <button
                    onClick={() => setIsPreOrder(!isPreOrder)}
                    className={`w-full rounded-xl p-3 border text-sm font-normal transition-colors ${isPreOrder ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                        }`}
                >
                    {isPreOrder ? "📋 Previsão para Amanhã (ativo)" : "📋 Marcar como Previsão"}
                </button>
            </section>*/}

            {/* Products */}
            <section className="px-4 pb-6 flex flex-col gap-2">
                <label className="text-muted-foreground text-xs uppercase tracking-widest mt-4">Selecione os Itens</label>
                <ProductGrid products={products} quantities={cart} onTap={tapProduct} onAdjust={adjustQty} />
            </section>

            {/* Payment */}
            <section className="px-4 pb-3 flex flex-col gap-2">
                <label className="text-muted-foreground text-xs uppercase tracking-widest mt-4">Forma de Pagamento</label>
                <PaymentSelector value={payment} onChange={setPayment} />
            </section>

            {/* Fixed bottom bar */}
            {(items.length > 0 || selectedClient) && (
                <div className="fixed bottom-0 w-full max-w-md z-60">
                    <div className="bg-card p-4 border border-border shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-muted-foreground text-xs">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
                                <p className="text-primary text-2xl tracking-tighter font-normal">{formatCurrency(total)}</p>
                            </div>
                            {items.length > 0 && (
                                <div className="text-right max-w-[50%]">
                                    {items.slice(0, 3).map((i) => (
                                        <p key={i.productId} className="text-muted-foreground text-[10px] truncate">
                                            {i.qty}× {i.productName}
                                        </p>
                                    ))}
                                    {items.length > 3 && (
                                        <p className="text-muted-foreground text-[10px]">+{items.length - 3} mais</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={submit}
                            disabled={!selectedClient || items.length === 0}
                            className="w-full bg-primary text-primary-foreground rounded-xl p-3.5 flex items-center justify-center gap-2 font-normal disabled:opacity-40 transition-transform active:scale-[0.98]"
                        >
                            <Check className="w-5 h-5" />
                            Confirmar Pedido
                            {/*isPreOrder ? "Salvar Previsão" : "Confirmar Pedido"*/}
                        </button>
                    </div>
                </div>
            )}

            {/* Client picker modal */}
            {showClientPicker && (
                <div className="fixed inset-0 bg-black/50 z-60 flex items-end justify-center">
                    <div className="w-full max-w-md bg-background rounded-t-2xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="font-display text-lg">Selecionar Cliente</h3>
                            <button onClick={() => { setShowClientPicker(false); setSearchQuery(""); setFilterCity(""); }}>
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-4 pt-3 pb-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* City filter */}
                        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setFilterCity("")}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-normal border transition-colors ${!filterCity ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                                    }`}
                            >
                                Todas
                            </button>
                            {(dayParam ? dayCities : availableCities).map(city => (
                                <button
                                    key={city}
                                    onClick={() => setFilterCity(filterCity === city ? "" : city)}
                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-normal border transition-colors ${filterCity === city ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                                        }`}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-y-auto flex-1 py-2">
                            {filteredClients.length === 0 && (
                                <p className="text-muted-foreground text-sm text-center py-6">Nenhum cliente encontrado</p>
                            )}
                            {filteredClients.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => selectClient(c)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-card transition-colors text-left"
                                >
                                    <div>
                                        <p className="text-foreground text-sm font-normal">{c.name}</p>
                                        <p className="text-muted-foreground text-xs">{c.cidade} — {c.phone}</p>
                                    </div>
                                    {c.averageOrder && Object.keys(c.averageOrder).length > 0 && (
                                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Recorrente</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
