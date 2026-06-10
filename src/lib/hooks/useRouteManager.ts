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
    const [prices, setPrices] = useState<Record<string, Record<string, number>>>({}); // <-- Novo estado para descontos

    const routeClients = useMemo(() =>
        allClients.filter((c) => todayCities.includes(c.city)),
    [allClients, todayCities]);

    const todayRevenue = useMemo(() =>
        orders.reduce((sum, o) => o.status === "ENTREGUE" ? sum + Number(o.total) : sum, 0),
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
        const initialQty: Record<string, Record<string, number>> = {};
        const initialPrices: Record<string, Record<string, number>> = {};

        routeClients.forEach((client) => {
            const lastOrder = orders
                .filter((order) => order.clientId === client.id || order.clientName === client.name)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

            if (lastOrder) {
                const clientQuantities: Record<string, number> = {};
                const clientPrices: Record<string, number> = {};

                lastOrder.products.forEach((product: any) => {
                    // Algumas APIs retornam id, outras productId. Garanta que pega o correto:
                    const pid = product.productId || product.id;

                    // 1. Restaura a quantidade
                    clientQuantities[pid] = Number(product.quantity);

                    // 2. Transforma o desconto (%) de volta em valor em Reais (R$)
                    if (product.discount && product.discount > 0) {
                        // Calcula o valor descontado
                        const discountAmount = Number(product.price) * (Number(product.discount) / 100);
                        const finalPrice = Number(product.price) - discountAmount;

                        // Salva com 2 casas decimais (ex: 15.00)
                        clientPrices[pid] = Number(finalPrice.toFixed(2));
                    } else {
                        // Se não teve desconto na venda anterior, mantém o preço base
                        clientPrices[pid] = Number(product.price);
                    }
                });

                initialQty[client.id] = clientQuantities;
                initialPrices[client.id] = clientPrices;
            }
        });

        setQuantities(initialQty);
        setPrices(initialPrices);
    };

    function adjustQty(clientId: string, productId: string, delta: number) {
        setQuantities((prev) => {
            const clientQty = { ...(prev[clientId] || {}) };
            clientQty[productId] = Math.max(0, (clientQty[productId] || 0) + delta);

            if (clientQty[productId] === 0) {
                delete clientQty[productId];
                // Limpa o preço customizado se a quantidade chegar a 0
                setPrices((p) => {
                    const cp = { ...(p[clientId] || {}) };
                    delete cp[productId];
                    return { ...p, [clientId]: cp };
                });
            }

            return { ...prev, [clientId]: clientQty };
        });
    }

    function setUnitPrice(clientId: string, productId: string, price: number) {
        setPrices((prev) => {
            const clientPrices = { ...(prev[clientId] || {}) };
            clientPrices[productId] = price;
            return { ...prev, [clientId]: clientPrices };
        });
    }

    function removeItem(clientId: string, productId: string) {
        setQuantities((prev) => {
            const clientQty = { ...(prev[clientId] || {}) };
            delete clientQty[productId];
            return { ...prev, [clientId]: clientQty };
        });
        setPrices((prev) => {
            const clientPrices = { ...(prev[clientId] || {}) };
            delete clientPrices[productId];
            return { ...prev, [clientId]: clientPrices };
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
        prices,
        adjustQty,
        setUnitPrice,
        removeItem,
        initializeQuantities
    };
}
