import { useMemo, useState } from "react";
import { Plus, Check, Trash2, Filter, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { EXPENSE_CATEGORIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useExpensesList, useCreateExpense, useDeleteExpense } from "@/lib/hooks/useExpenses";
import { useFormError } from "@/hooks/useFormError";
import FormField from "@/components/form/FormField";
import FormSubmitButton from "@/components/form/FormSubmitButton";
import DateRangeInput from "@/components/form/DateRangeInput";
import SelectField from "@/components/form/SelectField";
import Section from "@/components/layout/Section";
import LoadingState from "@/components/layout/LoadingState";
import EmptyState from "@/components/layout/EmptyState";

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
    const { errors, setFieldError, clearAll: clearErrors } = useFormError();

    // Filtros
    const [showFilters, setShowFilters] = useState(false);
    const [catFilter, setCatFilter] = useState<CatFilter>("todas");
    const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().slice(0, 7) + "-01");
    const [dateTo, setDateTo] = useState<string>(new Date().toISOString().slice(0, 10));
    const filterCategoryOptions = [
        { value: "todas", label: "Todas as categorias" },
        ...Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => ({ value: key, label })),
    ];
    const formCategoryOptions = Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => ({ value: key, label }));

    function submit() {
        const newErrors: Record<string, string> = {};
        if (!form.description.trim() || form.description.trim().length < 2) newErrors.description = "Descrição obrigatória (min. 2 caracteres)";
        if (form.value <= 0) newErrors.value = "Valor obrigatório (maior que 0)";

        if (Object.keys(newErrors).length > 0) {
            Object.entries(newErrors).forEach(([field, message]) => {
                setFieldError(field as keyof FormState, message);
            });
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
                clearErrors();
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
                <Section spacing="md" className="pb-3">
                    <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-foreground text-sm font-normal">Filtrar despesas</p>
                            <button onClick={resetFilters} className="text-muted-foreground text-xs flex items-center gap-1">
                                <X className="w-3 h-3" /> Limpar
                            </button>
                        </div>

                        <SelectField
                            label="Categoria"
                            value={catFilter}
                            onChange={(value) => setCatFilter(value as CatFilter)}
                            options={filterCategoryOptions}
                        />

                        <DateRangeInput
                            from={dateFrom}
                            to={dateTo}
                            onFromChange={setDateFrom}
                            onToChange={setDateTo}
                            fromLabel="De"
                            toLabel="Até"
                        />
                    </div>
                </Section>
            )}

            {showForm && (
                <Section className="animate-slide-up">
                    <div className="bg-card rounded-2xl p-4 border border-border space-y-3 shadow-sm">
                        <FormField
                            label="Descrição"
                            value={form.description}
                            onChange={(val) => setForm((f) => ({ ...f, description: val as string }))}
                            error={errors.description}
                            placeholder="Ex: Farinha de trigo"
                            required
                            maxLength={100}
                        />

                        <FormField
                            label="Valor (R$)"
                            value={form.value}
                            onChange={(val) => setForm((f) => ({ ...f, value: parseFloat(val as string) || 0 }))}
                            error={errors.value}
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            required
                        />

                        <SelectField
                            label="Categoria"
                            value={form.category}
                            onChange={(value) => setForm((f) => ({ ...f, category: value }))}
                            options={formCategoryOptions}
                            selectClassName="px-4 py-3"
                        />

                        <FormSubmitButton
                            onClick={submit}
                            loading={isCreating}
                            disabled={isCreating}
                            variant="accent"
                            icon={Check}
                        >
                            Lançar Despesa
                        </FormSubmitButton>
                    </div>
                </Section>
            )}

            {/* Lista de Despesas */}
            <Section spacing="lg" className="space-y-2">
                {isLoading && (
                    <LoadingState message="Buscando despesas..." />
                )}

                {!isLoading && filtered.length === 0 && (
                    <EmptyState message="Nenhuma despesa encontrada" />
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
            </Section>
        </div>
    );
}
