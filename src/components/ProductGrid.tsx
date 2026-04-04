import { useState } from "react";
import { Minus } from "lucide-react";
import { formatCurrency, type Product } from "@/lib/data";

interface ProductGridProps {
    products: Product[];
    quantities: Record<string, number>;
    onTap: (productId: string) => void;
    onAdjust: (productId: string, delta: number) => void;
    onSetQty?: (productId: string, qty: number) => void;
}

export default function ProductGri({ products, quantities, onTap, onAdjust, onSetQty }: ProductGridProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");

    function startEditing(pid: string, currentQty: number) {
        setEditingId(pid);
        setInputValue(String(currentQty));
    }

    function commitEdit(pid: string) {
        const parsed = parseInt(inputValue, 10);
        const newQty = isNaN(parsed) || parsed < 0 ? 0 : parsed;
        const currentQty = quantities[pid] || 0;
        if (onSetQty) {
            onSetQty(pid, newQty);
        } else {
            onAdjust(pid, newQty - currentQty);
        }
        setEditingId(null);

    }

    return (
        <div className="grid grid-cols-3 gap-2">
            {products.map((p) => {
                const qty = quantities[p.id] || 0;
                const isEditing = editingId === p.id;
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
                                {isEditing ? (
                                    <input
                                        type="number"
                                        min={0}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onBlur={() => commitEdit(p.id)}
                                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(p.id); }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-primary text-primary-foreground text-xs font-normal w-8 h-6 rounded-full text-center shadow-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        autoFocus
                                    />
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); startEditing(p.id, qty); }}
                                        className="bg-primary text-primary-foreground text-xs font-normal w-6 h-6 rounded-full flex items-center justify-center shadow-sm cursor-text"
                                    >
                                        {qty}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
