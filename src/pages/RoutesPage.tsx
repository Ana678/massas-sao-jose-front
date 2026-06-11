import { useEffect, useState, useMemo, useDeferredValue } from "react";
import SearchInput from "@/components/form/SearchInput";

import { Cloud, Plus, AlertCircle } from "lucide-react";
import { Link } from '@tanstack/react-router';
import { toast } from "sonner";
import Logo from "@/assets/logo.svg?react";
import { type Client } from "@/lib/types";
import { formatCurrency, getCitiesForToday } from "@/lib/utils";
import { useClients } from "@/lib/hooks/useClients";
import { useProducts } from "@/lib/hooks/useProduct";
import { useOrdersListByCity, useCreateOrder, useUpdateOrder } from "@/lib/hooks/useOrders";
import { getRouteOverrides, getSkippedClients, toggleSkipClient } from "@/lib/data";
import { useRouteManager } from "@/lib/hooks/useRouteManager";
import { ClientRouteCard } from "@/components/route/ClientRouteCard";
import { ClientDoneCard } from "@/components/route/ClientDoneCard";
import { SkippedClientsList } from "@/components/route/SkippedClientsList";
import { DeliveryConfirmModal } from "@/components/route/DeliveryConfirmModal";
import { RouteOverrideModal } from "@/components/route/RouteOverrideModal";
import { ClientRouteModal } from "@/components/route/ClientRouteModal";

export default function RoutesPage() {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const overrides = getRouteOverrides();
    const hasOverride = overrides.some((o) => o.date === todayStr);
    const todayCities = getCitiesForToday(today, overrides);
    const skipKey = todayStr;

    const { data: allClients = [], isLoading: loadingClients } = useClients();
    const { data: products = [], isLoading: loadingProducts } = useProducts();
    const { data: orders = [], isLoading: loadingOrders } = useOrdersListByCity(todayCities, todayStr);

    const [skipped, setSkipped] = useState(getSkippedClients());
    const skippedIds = skipped[skipKey] || [];

    const routeManager = useRouteManager(allClients, orders, todayCities, todayStr, skippedIds);

    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [deliveryClient, setDeliveryClient] = useState<Client | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
    const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();

    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const filteredPending = useMemo(() => {
        // Se estiver vazio, não gasta processamento com .filter()
        if (!deferredSearchQuery) return routeManager.pending;

        const lowerQuery = deferredSearchQuery.toLowerCase();

        return routeManager.pending.filter((c) =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.city.toLowerCase().includes(lowerQuery)
        );
    }, [routeManager.pending, deferredSearchQuery]);

    const filteredDone = useMemo(() => {
        if (!deferredSearchQuery) return routeManager.done;

        const lowerQuery = deferredSearchQuery.toLowerCase();

        return routeManager.done.filter((c) =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.city.toLowerCase().includes(lowerQuery)
        );
    }, [routeManager.done, deferredSearchQuery]);

    const handleToggleSkip = (clientId: string) => {
        const updated = toggleSkipClient(skipKey, clientId);
        setSkipped({ ...updated });
        if (skippedIds.includes(clientId)) {
            toast.success("Cliente restaurado na rota de hoje");
        } else {
            toast.success("Cliente pulado");
        }
    };

    useEffect(() => {
        if (allClients.length > 0 && orders.length > 0) {
            routeManager.initializeQuantities();
        }
    }, [allClients.length, orders.length]);

    const handleSavePendingOrder = () => {
        if (!editingClient) return;

        const clientId = editingClient.id;
        const clientQty = routeManager.quantities[clientId] || {};
        const clientPrices = routeManager.prices[clientId] || {};

        const orderProducts = Object.entries(clientQty)
            .filter(([, qty]) => qty > 0)
            .map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                const originalPrice = product?.price || 0;
                const customPrice = clientPrices[productId];

                let discountPercentage = 0;

                if (customPrice !== undefined && customPrice < originalPrice && originalPrice > 0) {
                    const calc = ((originalPrice - customPrice) / originalPrice) * 100;
                    discountPercentage = Number(calc.toFixed(2));
                }

                return {
                    productId,
                    quantity,
                    discount: discountPercentage
                };
            });

        if (orderProducts.length === 0) {
            toast.error("Adicione pelo menos um item para salvar o pedido.");
            return;
        }

        const existingOrder = orders.find(o => o.clientId === clientId);

        const payload = {
            clientId: clientId,
            paymentMethod: existingOrder?.paymentMethod || "dinheiro",
            isPaid: existingOrder?.isPaid || false,
            status: "PENDENTE",
            targetDate: todayStr,
            products: orderProducts,
        };

        if (existingOrder) {
            updateOrder(
                { id: existingOrder.id, ...payload },
                {
                    onSuccess: () => {
                        toast.success("Pedido do cliente atualizado!");
                        setEditingClient(null);
                    }
                }
            );
        } else {
            createOrder(
                payload,
                {
                    onSuccess: () => {
                        toast.success("Pedido adicionado à rota!");
                        setEditingClient(null);
                    }
                }
            );
        }
    };

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
            <header className="flex justify-between items-start px-6 pt-8 pb-4">
                <div className="font-display leading-[1.1] tracking-tighter text-xl">
                    <Logo className="h-10 w-auto object-contain" />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowOverrideModal(true)}
                        className="flex items-center gap-1 bg-card px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Alterar rota
                    </button>
                    <div className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full border border-border">
                        <Cloud className="w-4 h-4 text-primary" />
                        <span className="text-xs text-primary tracking-wide font-normal">Sync Ok</span>
                    </div>
                </div>
            </header>

            <section className="px-6 pt-2 pb-4">
                <h1 className="font-display text-3xl tracking-tight leading-tight">
                    {today.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')}, <br />
                    <span className="text-base">rota para </span>
                    <span className="italic text-base">{todayCities.join(", ") || "nenhuma cidade"}.</span>
                </h1>
                {hasOverride && <p className="text-accent text-xs mt-1">  Rota alterada para hoje</p>}
            </section>

            <section className="px-6 py-2">
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1.5">Vendido hoje</p>
                    <p className="text-primary text-4xl tracking-tighter font-normal">
                        {formatCurrency(routeManager.todayRevenue)}
                    </p>

                    <div className="border-t border-border mt-5 pt-5 flex justify-between items-center">
                        <div>
                            <p className="text-muted-foreground text-xs mb-1 tracking-wide">Pedidos</p>
                            <p className="text-foreground text-sm font-normal">{orders.length}</p>
                        </div>
                        <div className="w-px h-8 bg-border"></div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-xs mb-1 tracking-wide">Visitas</p>
                            <p className="text-foreground text-sm font-normal">
                                {routeManager.done.length}/{routeManager.routeClients.length}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-4">
                <Link to="/order/new" search={{ dia: undefined }}>
                    <button className="w-full bg-accent text-accent-foreground rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm">
                        <Plus className="w-6 h-6" />
                        <span className="text-base tracking-wide font-normal">Realizar Venda</span>
                    </button>
                </Link>

                {routeManager.unpaidOrders.length > 0 && (
                    <Link to="/orders" search={{ dia: undefined }}>
                        <button className="w-full mt-3 bg-card text-foreground border border-border rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                            <span className="flex items-center gap-2 text-sm">
                                <AlertCircle className="w-5 h-5 text-accent" />
                                Pedidos não pagos
                            </span>
                            <span className="text-primary text-sm font-medium">{routeManager.unpaidOrders.length}</span>
                        </button>
                    </Link>
                )}
            </section>

            <section className="px-6 pt-2 grow pb-24">
                <div className="flex justify-between items-end mb-3">
                    <h2 className="font-display text-lg tracking-tight">Rota de Hoje</h2>
                    <span className="text-muted-foreground text-xs">{routeManager.pending.length} visitas restantes</span>
                </div>

                <div className="space-y-3">
                    <div className="mb-4">
                        <SearchInput
                            placeholder="Buscar cliente ou cidade na rota..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />
                    </div>
                    {filteredPending.map((client) => (
                        <ClientRouteCard
                            key={client.id}
                            client={client}
                            products={products}
                            quantities={routeManager.quantities[client.id] || {}}
                            prices={routeManager.prices[client.id] || {}}
                            onSkip={() => handleToggleSkip(client.id)}
                            onDeliver={() => setDeliveryClient(client)}
                            onEdit={() => setEditingClient(client)}
                        />
                    ))}

                    {filteredDone.map((client) => (
                        <ClientDoneCard key={client.id} client={client} order={orders.find(o => o.clientId === client.id)} />
                    ))}

                    {routeManager.skippedClientsList.length > 0 && (
                        <SkippedClientsList
                            clients={routeManager.skippedClientsList}
                            onRestore={(id) => handleToggleSkip(id)}
                        />
                    )}
                </div>
            </section>

            {/* Modal de confirmação de entrega */}
            {deliveryClient && (
                <DeliveryConfirmModal
                    client={deliveryClient}
                    products={products}
                    quantities={routeManager.quantities[deliveryClient.id] || {}}
                    prices={routeManager.prices[deliveryClient.id] || {}}
                    onClose={() => setDeliveryClient(null)}
                />
            )}

            {showOverrideModal && (
                <RouteOverrideModal
                    onClose={() => setShowOverrideModal(false)}
                />
            )}

            {editingClient && (
                <ClientRouteModal
                    client={editingClient}
                    products={products}
                    quantities={routeManager.quantities[editingClient.id] || {}}
                    prices={routeManager.prices[editingClient.id] || {}}
                    onAdjustQty={(pid, delta) => routeManager.adjustQty(editingClient.id, pid, delta)}
                    onSetUnitPrice={(pid, price) => routeManager.setUnitPrice(editingClient.id, pid, price)}
                    onRemove={(pid) => routeManager.removeItem(editingClient.id, pid)}
                    onClose={() => setEditingClient(null)}
                    onSave={handleSavePendingOrder}
                    isSaving={isCreating || isUpdating}
                />
            )}
        </>
    );
}
