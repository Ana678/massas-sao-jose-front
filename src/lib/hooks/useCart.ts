import { useState, useMemo } from "react";
import type { Product } from "@/lib/types";

export function useCart(apiProducts: Product[]) {
    const [cart, setCart] = useState<Record<string, number>>({});

    const lineItems = useMemo(() =>
        Object.entries(cart).map(([productId, quantity]) => {
            const product = apiProducts.find((product) => product.id === productId);
            return {
                productId: productId,
                productName: product?.name || "",
                quantity,
                price: product?.price || 0,
            };
        }), [cart, apiProducts]);

    const total = lineItems.reduce((s, i) => s + i.quantity * i.price, 0);
    const totalItems = lineItems.reduce((s, i) => s + i.quantity, 0);

    const adjustQuantity = (productId: string, delta: number) => {
        setCart((prev) => {
            const q = Math.max(0, (prev[productId] || 0) + delta);
            const next = { ...prev };
            if (q === 0) delete next[productId];
            else next[productId] = q;
            return next;
        });
    };

    return { cart, setCart, lineItems, total, totalItems, adjustQuantity };
}
