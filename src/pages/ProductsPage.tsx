import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getProducts, saveProducts, type Product, formatCurrency } from "@/lib/data";

export default function ProductsPage() {
    const [products, setProducts] = useState(getProducts());
    const [editing, setEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", costPrice: 0, sellPrice: 0 });

    function startEdit(p: Product) {
        setEditing(p.id);
        setEditForm({ name: p.name, costPrice: p.costPrice, sellPrice: p.sellPrice });
    }

    function saveEdit(id: string) {
        const updated = products.map((p) =>
            p.id === id ? { ...p, name: editForm.name, costPrice: editForm.costPrice, sellPrice: editForm.sellPrice } : p
        );
        setProducts(updated);
        saveProducts(updated);
        setEditing(null);
    }

    return (
        <>
            <PageHeader title="Produtos" subtitle={`${products.length} cadastrados`} backTo="/caixa" />

            <section className="px-6 pb-6 space-y-2">
                {products.map((p) => (
                    <div key={p.id} className="bg-card rounded-xl p-4 border border-border">
                        {editing === p.id ? (
                            <div className="space-y-2">
                                <input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-muted-foreground text-xs">Custo</label>
                                        <input
                                            type="number"
                                            value={editForm.costPrice}
                                            onChange={(e) => setEditForm((f) => ({ ...f, costPrice: +e.target.value }))}
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-muted-foreground text-xs">Venda</label>
                                        <input
                                            type="number"
                                            value={editForm.sellPrice}
                                            onChange={(e) => setEditForm((f) => ({ ...f, sellPrice: +e.target.value }))}
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => saveEdit(p.id)}
                                    className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-normal"
                                >
                                    Salvar
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => startEdit(p)} className="w-full text-left">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{p.icon}</span>
                                        <div>
                                            <p className="text-foreground text-sm font-normal">{p.name}</p>
                                            <p className="text-muted-foreground text-xs">Custo: {formatCurrency(p.costPrice)}/{p.unit}</p>
                                        </div>
                                    </div>
                                    <p className="text-primary text-sm font-normal">{formatCurrency(p.sellPrice)}/{p.unit}</p>
                                </div>
                            </button>
                        )}
                    </div>
                ))}
            </section>
        </>
    );
}
