import { useEffect, useState } from "react";
import { Cloud, Plus, AlertCircle } from "lucide-react";
import { Link } from '@tanstack/react-router';
import Logo from "@/assets/logo.svg?react";
import { type Client } from "@/lib/types";
import { formatCurrency, getCitiesForToday } from "@/lib/utils";
import { useClients } from "@/lib/hooks/useClients";
import { useProducts } from "@/lib/hooks/useProduct";
import { useOrdersListByCity } from "@/lib/hooks/useOrders";
import { getRouteOverrides, getSkippedClients } from "@/lib/data";

import { useRouteManager } from "@/lib/hooks/useRouteManager";
import { ClientRouteCard } from "@/components/route/ClientRouteCard";
import { ClientDoneCard } from "@/components/route/ClientDoneCard";
import { SkippedClientsList } from "@/components/route/SkippedClientsList";
import { DeliveryConfirmModal } from "@/components/route/DeliveryConfirmModal";
import { RouteOverrideModal } from "@/components/route/RouteOverrideModal";

export default function RoutesPage() {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const overrides = getRouteOverrides();
    const hasOverride = overrides.some((o) => o.date === todayStr);
    const todayCities = getCitiesForToday(today, overrides);
    const skipKey = todayStr;

    const { data: allClients = [], isLoading: loadingClients } = useClients();
    const { data: products = [], isLoading: loadingProducts } = useProducts();
    const { data: orders = [], isLoading: loadingOrders } = useOrdersListByCity(todayCities);

    const [skipped, setSkipped] = useState(getSkippedClients());
    const skippedIds = skipped[skipKey] || [];

    const routeManager = useRouteManager(allClients, orders, todayCities, todayStr, skippedIds);

    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [deliveryClient, setDeliveryClient] = useState<Client | null>(null);

    useEffect(() => {
        if (allClients.length > 0 && orders.length > 0) {
            routeManager.initializeQuantities();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allClients.length, orders.length]); // Gatilhos reduzidos para evitar loop

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
            {/* Header Reduzido */}
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

            {/* Saudação e Status */}
            <section className="px-6 pt-2 pb-4">
                <h1 className="font-display text-3xl tracking-tight leading-tight">
                    {today.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')}, <br />
                    <span className="text-base">rota para </span>
                    <span className="italic text-base">{todayCities.join(", ") || "nenhuma cidade"}.</span>
                </h1>
                {hasOverride && <p className="text-accent text-xs mt-1">⚠️ Rota alterada para hoje</p>}
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

            {/* Ações Rápidas */}
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

            {/* Lista de Rota */}
            <section className="px-6 pt-2 grow pb-24">
                <div className="flex justify-between items-end mb-3">
                    <h2 className="font-display text-lg tracking-tight">Rota de Hoje</h2>
                    <span className="text-muted-foreground text-xs">{routeManager.pending.length} visitas restantes</span>
                </div>

                <div className="space-y-3">
                    {/* Lista Pendente */}
                    {routeManager.pending.map((client) => (
                        <ClientRouteCard
                            key={client.id}
                            client={client}
                            products={products}
                            quantities={routeManager.quantities[client.id] || {}}
                            onAdjustQty={(pid, delta) => routeManager.adjustQty(client.id, pid, delta)}
                            onSkip={() => {/* Chama a função de pular cliente e atualiza o estado setSkipped */}}
                            onDeliver={() => setDeliveryClient(client)}
                        />
                    ))}

                    {/* Lista Entregue */}
                    {routeManager.done.map((client) => (
                        <ClientDoneCard key={client.id} client={client} />
                    ))}

                    {/* Lista Pulados */}
                    {routeManager.skippedClientsList.length > 0 && (
                        <SkippedClientsList
                            clients={routeManager.skippedClientsList}
                            onRestore={(id) => {/* Lógica de restauração */}}
                        />
                    )}
                </div>
            </section>

            {/* Modais Extraídos */}
            {deliveryClient && (
                <DeliveryConfirmModal
                    client={deliveryClient}
                    quantities={routeManager.quantities[deliveryClient.id]}
                    onClose={() => setDeliveryClient(null)}
                />
            )}

            {showOverrideModal && (
                <RouteOverrideModal
                    onClose={() => setShowOverrideModal(false)}
                />
            )}
        </>
    );
}
