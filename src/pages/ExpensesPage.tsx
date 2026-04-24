import { useMemo, useState } from "react";
import { Plus, Check, Trash2, Filter, X, Cloud } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { EXPENSE_CATEGORIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useExpensesList, useCreateExpense, useDeleteExpense } from "@/lib/hooks/useExpenses";

interface FormState {
    description: string;
    value: number;
    category: string;
}
const emptyForm: FormState = { description: "", value: 0, category: "insumos" };

type CatFilter = "todas" | string;

export default function DespesasPage() {

    const { data: expenses = [], isLoading } = useExpensesList();
    const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
    const { mutate: deleteExpense, } = useDeleteExpense();

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    // Filtros
    const [showFilters, setShowFilters] = useState(false);
    const [catFilter, setCatFilter] = useState<CatFilter>("todas");
    const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().slice(0, 7) + "-01");
    const [dateTo, setDateTo] = useState<string>(new Date().toISOString().slice(0, 10));

    function submit() {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!form.description.trim() || form.description.trim().length < 2) e.description = "Descrição obrigatória";
        if (form.value <= 0) e.value = "Valor obrigatório";
        setErrors(e);
        if (Object.keys(e).length > 0) {
            toast.error("Verifique os campos");
            return;
        }

        createExpense({
            description: form.description.trim(),
            value: form.value,
            category: form.category,
        }, {
            onSuccess: () => {
                setShowForm(false);
                setForm(emptyForm);
                setErrors({});
            }
        });
    }

    function handleDelete(id: string) {
        deleteExpense(id);
    }

    function resetFilters() {
        setCatFilter("todas");
        setDateFrom(new Date().toISOString().slice(0, 7) + "-01");
        setDateTo(new Date().toISOString().slice(0, 10));
    }

    const filtered = useMemo(() => {
        const fromIso = dateFrom ? new Date(dateFrom + "T00:00:00").toISOString() : "";
        const toIso = dateTo ? new Date(dateTo + "T23:59:59").toISOString() : "";
        return expenses.filter((e) => {
            if (catFilter !== "todas" && e.category !== catFilter) return false;
            if (fromIso && e.createdAt < fromIso) return false;
            if (toIso && e.createdAt > toIso) return false;
            return true;
        });
    }, [expenses, catFilter, dateFrom, dateTo]);

    const total = filtered.reduce((s, e) => s + e.value, 0);
    const isFiltered = catFilter !== "todas" || dateFrom !== new Date().toISOString().slice(0, 7) + "-01"
        || dateTo !== new Date().toISOString().slice(0, 10);

    return (
        <div className="pb-24">
            <PageHeader
                title="Despesas"
                subtitle={`${filtered.length} • ${formatCurrency(total)}`}
                backTo="/caixa"
                rightAction={
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-xl relative ${showFilters || isFiltered ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"}`}
                            aria-label="Filtros"
                        >
                            <Filter className="w-4 h-4" />
                            {isFiltered && !showFilters && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-accent text-accent-foreground p-2 rounded-xl active:scale-95 transition-transform"
                            aria-label="Nova despesa"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                }
            />

            {showFilters && (
                <section className="px-6 pb-3">
                    <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-foreground text-sm font-normal">Filtrar despesas</p>
                            <button onClick={resetFilters} className="text-muted-foreground text-xs flex items-center gap-1">
                                <X className="w-3 h-3" /> Limpar
                            </button>
                        </div>

                        <div>
                            <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">Categoria</label>
                            <select
                                value={catFilter}
                                onChange={(e) => setCatFilter(e.target.value as CatFilter)}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                <option value="todas">Todas as categorias</option>
                                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">De</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div>
                                <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">Até</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {showForm && (
                <section className="px-6 pb-4 animate-slide-up">
                    <div className="bg-card rounded-2xl p-4 border border-border space-y-3 shadow-sm">
                        <div>
                            <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">
                                Descrição <span className="text-destructive">*</span>
                            </label>
                            <input
                                placeholder="Ex: Farinha de trigo"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                maxLength={100}
                                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.description ? "border-destructive" : "border-border"}`}
                            />
                            {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">
                                Valor (R$) <span className="text-destructive">*</span>
                            </label>
                            <input
                                inputMode="numeric"
                                placeholder="0"
                                value={form.value}
                                onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                                className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.value ? "border-destructive" : "border-border"}`}
                            />
                            {errors.value && <p className="text-destructive text-xs mt-1">{errors.value}</p>}
                        </div>

                        <div>
                            <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">
                                Categoria
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={submit}
                            disabled={isCreating}
                            className="w-full bg-accent text-accent-foreground rounded-xl p-3 flex items-center justify-center gap-2 font-normal transition-transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {isCreating ? (
                                "Salvando..."
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Lançar Despesa
                                </>
                            )}
                        </button>
                    </div>
                </section>
            )}

            {/* Lista de Despesas */}
            <section className="px-6 pb-6 space-y-2">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                        <Cloud className="w-8 h-8 animate-pulse text-primary" />
                        <p className="text-sm">Buscando despesas...</p>
                    </div>
                )}

                {!isLoading && filtered.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">Nenhuma despesa encontrada</p>
                )}

                {!isLoading && [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((e) => (
                    <div key={e.id} className="bg-card rounded-xl p-4 border border-border space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-foreground text-sm font-normal break-word">{e.description}</p>
                                <p className="text-muted-foreground text-xs mt-1">{new Date(e.createdAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="bg-destructive/10 text-destructive p-2 rounded-lg shrink-0" aria-label="Excluir">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Remover <strong>{e.description}</strong> ({formatCurrency(e.value)})?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(e.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Excluir
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                        <div className="flex flex-col gap-2 pt-3 border-t border-border">
                            <span className="text-muted-foreground text-xs">{EXPENSE_CATEGORIES[e.category as keyof typeof EXPENSE_CATEGORIES] || e.category}</span>
                            <p className="text-accent text-xl tracking-tighter font-normal">-{formatCurrency(e.value)}</p>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
