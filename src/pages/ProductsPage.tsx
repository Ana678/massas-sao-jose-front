import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { type Product } from "@/lib/types";
import { useProducts, useSaveProduct } from "@/lib/hooks/useProduct";
import { CookieIcon } from "lucide-react";

export default function ProductsPage() {
    const { data: products = [], isLoading, isError } = useProducts();
    const { mutate: saveProduct } = useSaveProduct();

    const [editing, setEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: "", investment: 0, price: 0 });

    function startEdit(p: Product) {
        setEditing(p.id);
        setEditForm({ name: p.name, investment: p.investment, price: p.price });
    }

    function saveEdit(id: string) {
        saveProduct(
            { id, ...editForm },
            {
                onSuccess: () => setEditing(null)
            }
        );
    }

    if (isLoading) return <div className="h-screen flex items-center justify-center p-6 text-muted-foreground"><p>Carregando produtos...</p></div>;
    if (isError) return <div className="h-screen flex items-center justify-center text-destructive">Erro ao carregar os produtos.</div>;

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
                                            value={editForm.investment}
                                            onChange={(e) => setEditForm((f) => ({ ...f, investment: +e.target.value }))}
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-muted-foreground text-xs">Venda</label>
                                        <input
                                            type="number"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm((f) => ({ ...f, price: +e.target.value }))}
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
                                        <span className="text-2xl"><CookieIcon /></span>
                                        <div>
                                            <p className="text-foreground text-sm font-normal">{p.name}</p>
                                            <p className="text-muted-foreground text-xs">Custo: {formatCurrency(p.investment)}/und</p>
                                        </div>
                                    </div>
                                    <p className="text-primary text-sm font-normal">{formatCurrency(p.price)}/und</p>
                                </div>
                            </button>
                        )}
                    </div>
                ))}
            </section>
        </>
    );
}
