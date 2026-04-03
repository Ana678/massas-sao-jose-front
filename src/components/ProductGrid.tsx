import { Minus } from "lucide-react";
import { formatCurrency, type Product } from "@/lib/data";

interface ProductGridProps {
    products: Product[];
    quantities: Record<string, number>;
    onTap: (productId: string) => void;
    onAdjust: (productId: string, delta: number) => void;
}

export default function ProductGrid({ products, quantities, onTap, onAdjust }: ProductGridProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {products.map((p) => {
                const qty = quantities[p.id] || 0;
                return (
                    <div key={p.id} className="relative">
                        <button
                            onClick={() => onTap(p.id)}
                            className={`w-full h-full bg-card rounded-xl p-3 border transition-all active:scale-95 flex flex-col items-center gap-1.5 min-h-[90px] justify-center ${qty > 0 ? "border-primary shadow-sm" : "border-border"
                                }`}
                        >
                            <span className="text-2xl">{p.icon}</span>
                            <span className="text-foreground text-[10px] leading-tight text-center font-normal">{p.name}</span>
                            <span className="text-primary text-[10px]">{formatCurrency(p.sellPrice)}</span>
                        </button>
                        {qty > 0 && (
                            <div className="absolute -top-2.5 right-1.5 flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAdjust(p.id, -1); }}
                                    className="w-6 h-6 rounded-full bg-destructive text-accent-foreground flex items-center justify-center shadow-sm"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="bg-primary text-primary-foreground text-xs font-normal w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                                    {qty}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
