import { useState } from "react";
import { Minus, Plus, Percent, X, Trash2 } from "lucide-react";
import { type Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export interface LineItem {
  productId: string;
  qty: number;
  unitPrice: number;
}

interface Props {
  items: LineItem[];
  products: Product[];
  onAdjustQty: (productId: string, delta: number) => void;
  onSetUnitPrice: (productId: string, unitPrice: number) => void;
  onRemove?: (productId: string) => void;
}

export default function LineItemsList({
  items,
  products,
  onAdjustQty,
  onSetUnitPrice,
  onRemove,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [qtyInputValue, setQtyInputValue] = useState("");

  function startEditingQty(pid: string, currentQty: number) {
    setEditingQtyId(pid);
    setQtyInputValue(String(currentQty));
  }

  function commitQtyEdit(pid: string, currentQty: number) {
    const parsed = parseInt(qtyInputValue, 10);
    const newQty = isNaN(parsed) || parsed < 0 ? 0 : parsed;

    if (newQty === 0 && onRemove) {
      onRemove(pid);
    } else {
      onAdjustQty(pid, newQty - currentQty);
    }
    setEditingQtyId(null);
  }

  return (
    <div className="space-y-3">
      {products.map((p) => {
        const it = items.find((x) => x.productId === p.id);

        const isEditingQty = editingQtyId === p.id;

        const committedQty = it ? it.qty : 0;

        const displayQty = isEditingQty ? (parseInt(qtyInputValue, 10) || 0) : committedQty;

        const original = p.price || (p as any).sellPrice || 0;

        const unitPrice = it ? it.unitPrice : original;

        const hasDiscount = unitPrice < original - 0.001;
        const discountPct = original > 0 ? Math.round((1 - unitPrice / original) * 100) : 0;
        const subtotal = unitPrice * displayQty;

        const open = openId === p.id && displayQty > 0;

        return (
          <div key={p.id} className={`bg-card border rounded-2xl overflow-hidden transition-all ${displayQty > 0 ? 'border-primary/30' : 'border-border'}`}>

            <div className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className={`text-sm font-medium truncate transition-colors ${displayQty > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {p.name}
                </p>

                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {hasDiscount && displayQty > 0 ? (
                    <>
                      <span className="bg-primary/5 px-1.5 py-0.5 rounded-lg font-normal text-[11px] text-primary/50 line-through">
                        {formatCurrency(original)}
                      </span>
                      <span className="bg-primary/10 px-1.5 py-0.5 rounded-lg font-medium text-[11px] text-primary">
                        {formatCurrency(unitPrice)} (-{discountPct}%)
                      </span>
                    </>
                  ) : (
                    <span className={`bg-primary/5 px-1.5 py-0.5 rounded-lg font-normal text-[11px] transition-colors ${displayQty > 0 ? 'text-primary/70' : 'text-muted-foreground'}`}>
                      {formatCurrency(original)}
                    </span>
                  )}
                </div>

                <p className={`text-xs mt-1.5 transition-colors ${displayQty > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  Subtotal: {formatCurrency(subtotal)}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">

                  {displayQty > 0 ? (
                    <button
                      onClick={() => setOpenId(open ? null : p.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
                        open || hasDiscount
                          ? "bg-accent border-accent text-accent-foreground"
                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                      }`}
                      aria-label="Desconto"
                    >
                      <Percent className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="w-8 h-8" />
                  )}

                  <div className="flex items-center gap-2 bg-background rounded-2xl border border-border p-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (committedQty > 0) onAdjustQty(p.id, -1);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${committedQty > 0 ? 'hover:bg-muted active:scale-90 text-foreground' : 'opacity-30 cursor-not-allowed text-muted-foreground'}`}
                      disabled={committedQty === 0}
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    {isEditingQty ? (
                      <input
                        type="number"
                        min={0}
                        value={qtyInputValue}
                        onChange={(e) => setQtyInputValue(e.target.value)}
                        onBlur={() => commitQtyEdit(p.id, committedQty)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitQtyEdit(p.id, committedQty); }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-primary/10 text-primary text-sm font-medium w-8 h-8 rounded-lg text-center shadow-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          startEditingQty(p.id, committedQty);
                        }}
                        className={`text-sm font-medium w-8 text-center cursor-text transition-colors ${committedQty > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {committedQty}
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onAdjustQty(p.id, 1);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-transform ${displayQty > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {open && (
              <div className="bg-background/50 px-4 py-3 border-t border-border animate-slide-up">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Desconto %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={hasDiscount ? discountPct : ""}
                      placeholder="0"
                      onChange={(e) => {
                        const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        onSetUnitPrice(p.id, +(original * (1 - pct / 100)).toFixed(2));
                      }}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                      Preço R$
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => onSetUnitPrice(p.id, Math.max(0, Number(e.target.value) || 0))}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/50">
                  {hasDiscount ? (
                    <button
                      onClick={() => onSetUnitPrice(p.id, original)}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 py-1 px-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-3 h-3" /> Remover desconto
                    </button>
                  ) : <div></div>}

                  {onRemove && (
                    <button
                      onClick={() => onRemove(p.id)}
                      className="text-[11px] text-destructive flex items-center gap-1.5 py-1 px-2 rounded hover:bg-destructive/10 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3 h-3" /> Zerar quantidade
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
