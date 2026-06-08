import { X } from "lucide-react";
import LineItemsList from "@/components/LineItemsList";
import { type Client } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ClientRouteModalProps {
    client: Client;
    products: any[];
    quantities: Record<string, number>;
    prices: Record<string, number>;
    onAdjustQty: (productId: string, delta: number) => void;
    onSetUnitPrice: (productId: string, price: number) => void;
    onRemove: (productId: string) => void;
    onClose: () => void;
    onSave?: () => void;
    isSaving?: boolean;
}

export function ClientRouteModal({
    client,
    products,
    quantities,
    prices,
    onAdjustQty,
    onSetUnitPrice,
    onRemove,
    onClose,
    onSave,
    isSaving
}: ClientRouteModalProps) {

    const items = Object.entries(quantities || {})
        .filter(([, q]) => q > 0)
        .map(([pid, q]) => {
            const p = products.find(x => x.id === pid);
            const unitPrice = prices[pid] !== undefined ? prices[pid] : (p?.price || 0);
            return { productId: pid, qty: q, unitPrice };
        });

    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

    const sortedProducts = [...products].sort((a, b) => {
        const qtyA = quantities[a.id] || 0;
        const qtyB = quantities[b.id] || 0;
        if (qtyB !== qtyA) {
            return qtyB - qtyA;
        }
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-end justify-center" onClick={onClose}>
            <div className="w-full max-w-md bg-background rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="min-w-0 flex flex-col gap-1">
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Editar pedido</p>
                        <h3 className="font-display text-lg leading-tight truncate">{client.name}</h3>
                    </div>
                    <button onClick={onClose} aria-label="Fechar">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-4 space-y-4">
                    <div>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest mb-2">Itens com desconto/preço</p>
                        <LineItemsList
                            items={items}
                            products={sortedProducts}
                            onAdjustQty={(pid, delta) => onAdjustQty(pid, delta)}
                            onSetUnitPrice={(pid, price) => onSetUnitPrice(pid, price)}
                            onRemove={(pid) => onRemove(pid)}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-border flex items-center justify-between gap-3">
                    <div>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-widest">Total</p>
                        <p className="text-primary text-2xl tracking-tighter font-normal">
                            {formatCurrency(subtotal)}
                        </p>
                    </div>

                    <button
                        onClick={onSave || onClose}
                        disabled={isSaving}
                        className={`bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-normal transition-transform active:scale-95 ${
                            isSaving ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isSaving ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
