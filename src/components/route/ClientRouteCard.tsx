import { CheckCircle, FileText, X, Pencil } from "lucide-react";
import AddressLink from "@/components/AddressLink";
import PhoneButton from "@/components/PhoneButton";
import ItemBreakdown from "@/components/ItemBreakdown";
import { type Client } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ClientRouteCardProps {
    client: Client;
    products: any[];
    quantities: Record<string, number>;
    onSkip: () => void;
    onDeliver: () => void;
    onEdit: () => void;
    prices: Record<string, number>;
}

export function ClientRouteCard({
    client,
    products,
    quantities,
    onSkip,
    onDeliver,
    onEdit,
    prices
}: ClientRouteCardProps) {
    const hasNF = client.needFiscalNote || !!(client.socialReason && client.cnpj);

    const items = Object.entries(quantities || {})
        .filter(([, q]) => q > 0)
        .map(([pid, q]) => {
            const p = products.find(x => x.id === pid);
            const unitPrice = prices[pid] !== undefined ? prices[pid] : Number(p?.price || 0);
            const originalPrice = Number(p?.price || 0);
            return { qty: q, unitPrice, originalPrice, productId: pid };
        });

    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

    return (
        <div className="bg-card rounded-xl p-4 flex flex-col gap-3 border border-border animate-slide-up">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0"></div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
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
            <button
                onClick={onEdit}
                className="text-left bg-background/50 rounded-lg p-2.5 border border-border/60 hover:border-primary/40 transition-colors"
            >
                {items.length > 0 ? (
                    <>
                        <ItemBreakdown quantities={quantities} products={products}/>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                            <span className="text-muted-foreground text-[11px]">{items.length} itens · toque para editar</span>
                            <span className="text-primary text-sm font-medium">
                                {formatCurrency(subtotal)}
                            </span>
                        </div>
                    </>
                ) : (
                    <span className="text-muted-foreground text-xs flex items-center gap-2">
                        <Pencil className="w-3 h-3" />
                        Adicionar itens para este cliente
                    </span>
                )}
            </button>

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                    {hasNF && (
                        <button className="text-primary text-[11px] flex items-center gap-1 hover:underline">
                            <FileText className="w-3.5 h-3.5" />
                            Gerar NF
                        </button>
                    )}
                    <button
                        onClick={onSkip}
                        className="text-destructive/60 hover:text-destructive text-[11px] flex items-center gap-1 transition-colors ml-2"
                    >
                        <X className="w-3.5 h-3.5" />
                        Pular
                    </button>
                </div>
                <button
                    onClick={onDeliver}
                    disabled={items.length === 0}
                    className="text-primary-foreground text-xs bg-primary px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform disabled:opacity-40"
                >
                    <CheckCircle className="w-4 h-4" />
                    Entregue
                </button>
            </div>
        </div>
    );
}
