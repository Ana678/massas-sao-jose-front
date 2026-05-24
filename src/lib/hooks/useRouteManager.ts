import { useState, useMemo } from "react";
import { type Client, type Order } from "@/lib/types";

export function useRouteManager(
    allClients: Client[],
    orders: Order[],
    todayCities: string[],
    todayStr: string,
    skippedIds: string[]
) {
    // Estado apenas para o que é manipulado na tela antes de salvar
    const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});

    // 1. Derivando clientes da rota de hoje
    const routeClients = useMemo(() =>
        allClients.filter((c) => todayCities.includes(c.city)),
    [allClients, todayCities]);

    // 2. Calculando Receita e Pedidos Pendentes
    const todayRevenue = useMemo(() =>
        orders.reduce((sum, o) => sum + o.total, 0),
    [orders]);

    const unpaidOrders = useMemo(() =>
        orders.filter((o) => !o.isPaid && o.createdAt.startsWith(todayStr)),
    [orders, todayStr]);


    const checkIfDeliveredToday = (client: Client) => {
        return orders.some(o => {
            // 1. É o cliente correto?
            const isSameClient = o.clientId === client.id || o.clientName === client.name;

            // 2. O pedido foi feito hoje?
            const isToday = o.createdAt.startsWith(todayStr);

            // 3. O status está como entregue? (Ignora se for PENDENTE, EM_ROTA, etc)
            const isDelivered = o.status === "ENTREGUE";

            return isSameClient && isToday && isDelivered;
        });
    };

    // 4. Separando as listas (Sem precisar de useEffect!)
    const pending = routeClients.filter((c) => !checkIfDeliveredToday(c) && !skippedIds.includes(c.id));
    const done = routeClients.filter((c) => checkIfDeliveredToday(c));
    const skippedClientsList = routeClients.filter(c => skippedIds.includes(c.id));

    // 5. Função para pré-carregar as quantidades baseadas no último pedido
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

    // 6. Atualizador de quantidades da UI
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
