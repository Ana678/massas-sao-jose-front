import { useState, useMemo } from "react";
import { type Client, type Order } from "@/lib/types";

export function useRouteManager(
    allClients: Client[],
    orders: Order[],
    todayCities: string[],
    todayStr: string,
    skippedIds: string[]
) {
    const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});

    const routeClients = useMemo(() =>
        allClients.filter((c) => todayCities.includes(c.city)),
    [allClients, todayCities]);

    const todayRevenue = useMemo(() =>
        orders.reduce((sum, o) => o.status === "ENTREGUE" ? sum + o.total : sum, 0),
    [orders]);

    const unpaidOrders = useMemo(() =>
        orders.filter((o) => !o.isPaid && o.createdAt.startsWith(todayStr)),
    [orders, todayStr]);


    const checkIfDeliveredToday = (client: Client) => {
        return orders.some(o => {
            const isSameClient = o.clientId === client.id || o.clientName === client.name;

            const isToday = o.createdAt.startsWith(todayStr);

            const isDelivered = o.status === "ENTREGUE";

            return isSameClient && isToday && isDelivered;
        });
    };

    const pending = routeClients.filter((c) => !checkIfDeliveredToday(c) && !skippedIds.includes(c.id));
    const done = routeClients.filter((c) => checkIfDeliveredToday(c));
    const skippedClientsList = routeClients.filter(c => skippedIds.includes(c.id));

    const initializeQuantities = () => {
        const initial: Record<string, Record<string, number>> = {};
        routeClients.forEach((client) => {
            const lastOrder = orders
                .filter((order) => order.clientId === client.id || order.clientName === client.name)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            if (lastOrder) {
                const clientQuantities: Record<string, number> = {};
                lastOrder.products.forEach((product) => {
                    clientQuantities[product.id] = Number(product.quantity);
                });
                initial[client.id] = clientQuantities;
            }
        });
        setQuantities(initial);
    };

    function adjustQty(clientId: string, productId: string, delta: number) {
        setQuantities((prev) => {
            const clientQty = { ...(prev[clientId] || {}) };
            clientQty[productId] = Math.max(0, (clientQty[productId] || 0) + delta);
            return { ...prev, [clientId]: clientQty };
        });
    }

    return {
        routeClients,
        pending,
        done,
        skippedClientsList,
        todayRevenue,
        unpaidOrders,
        quantities,
        adjustQty,
        initializeQuantities
    };
}
