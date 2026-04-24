import { Minus, Plus } from "lucide-react";
import { type Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ProductGridProps {
    products: Product[];
    quantities: Record<string, number>;
    onTap: (productId: string) => void;
    onAdjust: (productId: string, delta: number) => void;
    onSetQty?: (productId: string, qty: number) => void;
}

export default function ProductGrid({ products, quantities, onAdjust, onSetQty }: ProductGridProps) {
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
        <div className="space-y-4">

            <div className="grid grid-cols-1 gap-3">
                {products.map((product) => {

                    const qty = quantities[product.id] || 0;
                    const price = product.price || 0;
                    const isEditing = editingId === product.id;

                    return (
                        <div key={product.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-sm font-medium truncate">
                                    {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <span className="bg-primary/5 p-1 rounded-lg font-normal text-xs text-primary/50 mr-1.5">{formatCurrency(price)}</span>
                                    Subtotal: {formatCurrency(price * qty)}
                                </p>

                            </div>
                            <div className="flex items-center gap-3 bg-background rounded-2xl border border-border p-1">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onAdjust(product.id, -1);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted active:scale-90 transition-transform"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        min={0}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onBlur={() => commitEdit(product.id)}
                                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(product.id); }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-primary/10 text-primary text-sm font-medium w-10 h-8 rounded-lg text-center shadow-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        autoFocus
                                    />
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            startEditing(product.id, qty);
                                        }}
                                        className="text-sm font-medium w-10 text-center cursor-text hover:text-primary transition-colors"
                                    >
                                        {qty}
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onAdjust(product.id, 1);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary text-white active:scale-90 transition-transform"
                                >
                                    <Plus className="w-3 h-3" color="white" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
