import { CheckCircle, FileText, X } from "lucide-react";
import AddressLink from "@/components/AddressLink";
import PhoneButton from "@/components/PhoneButton";
import ItemBreakdown from "@/components/ItemBreakdown";
import QtyAdjuster from "@/components/QtyAdjuster";
import { type Client } from "@/lib/types";

interface ClientRouteCardProps {
    client: Client;
    products: any[];
    quantities: Record<string, number>;
    onAdjustQty: (productId: string, delta: number) => void;
    onSkip: () => void;
    onDeliver: () => void;
}

export function ClientRouteCard({
    client,
    products,
    quantities,
    onAdjustQty,
    onSkip,
    onDeliver
}: ClientRouteCardProps) {
    const hasNF = client.needFiscalNote || !!(client.socialReason && client.cnpj);

    return (
        <div className="bg-card rounded-xl p-4 flex flex-col gap-3 border border-border animate-slide-up">
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

            <ItemBreakdown quantities={quantities} products={products} />

            <div className="space-y-1">
                {products.map((p) => {
                    const qty = quantities[p.id] || 0;
                    return (
                        <QtyAdjuster
                            key={p.id}
                            label={p.name}
                            qty={qty}
                            onAdjust={(delta) => onAdjustQty(p.id, delta)}
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
                        onClick={onSkip}
                        className="text-destructive/60 hover:text-destructive text-[11px] flex items-center gap-1 transition-colors ml-2"
                    >
                        <X className="w-3.5 h-3.5" />
                        Pular
                    </button>
                </div>
                <button
                    onClick={onDeliver}
                    className="text-primary-foreground text-xs bg-primary px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                    <CheckCircle className="w-4 h-4" />
                    Entregue
                </button>
            </div>
        </div>
    );
}
