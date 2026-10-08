import { useEffect, useMemo, useState } from "react";
import { toDateStr } from "@/lib/date";
import { maskMoney, parseMoney } from "@/lib/masks";
import { Plus, Check, Trash2, Filter, X, Pencil } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { EXPENSE_CATEGORIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useExpensesList, useCreateExpense, useUpdateExpense, useDeleteExpense, type ExpensesResponse } from "@/lib/hooks/useExpenses";
import { useFormError } from "@/hooks/useFormError";
import FormField from "@/components/form/FormField";
import FormSubmitButton from "@/components/form/FormSubmitButton";
import DateRangeInput from "@/components/form/DateRangeInput";
import SelectField from "@/components/form/SelectField";
import SegmentedControl from "@/components/form/SegmentedControl";
import Section from "@/components/layout/Section";
import Modal from "@/components/layout/Modal";
import LoadingState from "@/components/layout/LoadingState";
import EmptyState from "@/components/layout/EmptyState";

const PAGE_SIZE = 10;

interface FormState {
    description: string;
    /** Texto mascarado ("12,50"); convertido com parseMoney no envio. */
    value: string;
    category: string;
    /** YYYY-MM-DD, no fuso local. */
    date: string;
}
const emptyForm = (): FormState => ({ description: "", value: "", category: "insumos", date: toDateStr() });

type CatFilter = "todas" | string;
type Period = "todas" | "semana" | "mes" | "personalizado";

const PERIOD_TABS = [
    { key: "todas", label: "Todas" },
    { key: "semana", label: "Última semana" },
    { key: "mes", label: "Último mês" },
    { key: "personalizado", label: "Período" },
];

/** Hoje menos `days` dias, como YYYY-MM-DD local. */
function daysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return toDateStr(d);
}

/** Semana passada fechada: segunda a domingo da semana anterior. */
function lastWeekRange(): [string, string] {
    const today = new Date();
    const daysSinceMonday = (today.getDay() + 6) % 7; // getDay: 0 = domingo
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday - 7);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return [toDateStr(monday), toDateStr(sunday)];
}

/** Mês passado fechado: do dia 1 ao último dia do mês anterior. */
function lastMonthRange(): [string, string] {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0); // dia 0 = último do mês anterior
    return [toDateStr(first), toDateStr(last)];
}

/** Intervalo [de, até] em YYYY-MM-DD; string vazia = sem limite. */
function periodRange(period: Period, customFrom: string, customTo: string): [string, string] {
    switch (period) {
        case "semana": return lastWeekRange();
        case "mes": return lastMonthRange();
        case "personalizado": return [customFrom, customTo];
        default: return ["", ""];
    }
}

/** Meio-dia local evita que a conversão para UTC jogue a despesa para outro dia. */
function dateToIso(date: string) {
    return new Date(date + "T12:00:00").toISOString();
}

export default function DespesasPage() {

    const { data: expenses = [], isLoading } = useExpensesList();
    const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
    const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
    const { mutate: deleteExpense, } = useDeleteExpense();

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [editing, setEditing] = useState<ExpensesResponse | null>(null);
    const { errors, setFieldError, clearAll: clearErrors } = useFormError();

    const [showFilters, setShowFilters] = useState(false);
    const [catFilter, setCatFilter] = useState<CatFilter>("todas");
    const [period, setPeriod] = useState<Period>("todas");
    const [customFrom, setCustomFrom] = useState<string>(daysAgo(29));
    const [customTo, setCustomTo] = useState<string>(toDateStr());
    const [page, setPage] = useState(1);
    const filterCategoryOptions = [
        { value: "todas", label: "Todas as categorias" },
        ...Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => ({ value: key, label })),
    ];
    const formCategoryOptions = Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => ({ value: key, label }));

    function closeForm() {
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm());
        clearErrors();
    }

    function openNewForm() {
        clearErrors();
        setEditing(null);
        setForm(emptyForm());
        setShowForm(true);
    }

    function startEdit(e: ExpensesResponse) {
        clearErrors();
        setEditing(e);
        setForm({
            description: e.description,
            value: maskMoney(Number(e.value).toFixed(2)),
            category: e.category,
            date: toDateStr(new Date(e.createdAt)),
        });
        setShowForm(true);
    }

    function submit() {
        const value = parseMoney(form.value);
        const newErrors: Record<string, string> = {};
        if (!form.description.trim() || form.description.trim().length < 3) newErrors.description = "Descrição obrigatória (min. 3 caracteres)";
        if (value <= 0) newErrors.value = "Valor obrigatório (maior que 0)";
        if (!form.date) newErrors.date = "Data obrigatória";

        if (Object.keys(newErrors).length > 0) {
            Object.entries(newErrors).forEach(([field, message]) => {
                setFieldError(field as keyof FormState, message);
            });
            toast.error("Verifique os campos");
            return;
        }

        const data = {
            description: form.description.trim(),
            value,
            category: form.category,
        };

        if (editing) {
            // Só reenvia a data se ela mudou, para não perder o horário original.
            const dateChanged = form.date !== toDateStr(new Date(editing.createdAt));
            updateExpense(
                { id: editing.id, ...data, ...(dateChanged && { date: dateToIso(form.date) }) },
                { onSuccess: closeForm },
            );
            return;
        }

        createExpense({ ...data, date: dateToIso(form.date) }, { onSuccess: closeForm });
    }

    function handleDelete(id: string) {
        deleteExpense(id);
    }

    function resetFilters() {
        setCatFilter("todas");
        setPeriod("todas");
    }

    const [dateFrom, dateTo] = periodRange(period, customFrom, customTo);

    const filtered = useMemo(() => {
        const fromIso = dateFrom ? new Date(dateFrom + "T00:00:00").toISOString() : "";
        const toIso = dateTo ? new Date(dateTo + "T23:59:59.999").toISOString() : "";
        return expenses
            .filter((e) => {
                if (catFilter !== "todas" && e.category !== catFilter) return false;
                const createdIso = new Date(e.createdAt).toISOString();
                if (fromIso && createdIso < fromIso) return false;
                if (toIso && createdIso > toIso) return false;
                return true;
            })
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [expenses, catFilter, dateFrom, dateTo]);

    // Qualquer mudança de filtro volta para a primeira página.
    useEffect(() => { setPage(1); }, [catFilter, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    // Se uma exclusão esvaziar a última página, recua em vez de mostrar vazio.
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const total = filtered.reduce((s, e) => s + Number(e.value), 0);
    const isFiltered = catFilter !== "todas";

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
                            onClick={openNewForm}
                            className="bg-accent text-accent-foreground p-2 rounded-xl active:scale-95 transition-transform"
                            aria-label="Nova despesa"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                }
            />

            <Section spacing="md" className="pb-3 space-y-3">
                <SegmentedControl
                    tabs={PERIOD_TABS}
                    activeKey={period}
                    onChange={(key) => setPeriod(key as Period)}
                />
                {period === "personalizado" && (
                    <DateRangeInput
                        from={customFrom}
                        to={customTo}
                        onFromChange={setCustomFrom}
                        onToChange={setCustomTo}
                        fromLabel="De"
                        toLabel="Até"
                    />
                )}
            </Section>

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
                    </div>
                </Section>
            )}

            <Modal
                isOpen={showForm}
                onClose={closeForm}
                title={editing ? "Editar Despesa" : "Nova Despesa"}
                footer={
                    <FormSubmitButton
                        onClick={submit}
                        loading={isCreating || isUpdating}
                        disabled={isCreating || isUpdating}
                        variant="accent"
                        icon={Check}
                    >
                        {editing ? "Salvar Alterações" : "Lançar Despesa"}
                    </FormSubmitButton>
                }
            >
                <div className="space-y-3">
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
                        onChange={(val) => setForm((f) => ({ ...f, value: val as string }))}
                        error={errors.value}
                        mask={maskMoney}
                        inputMode="numeric"
                        placeholder="0,00"
                        required
                    />

                    <FormField
                        label="Data"
                        value={form.date}
                        onChange={(val) => setForm((f) => ({ ...f, date: val as string }))}
                        error={errors.date}
                        type="date"
                        required
                    />

                    <SelectField
                        label="Categoria"
                        value={form.category}
                        onChange={(value) => setForm((f) => ({ ...f, category: value }))}
                        options={formCategoryOptions}
                        selectClassName="px-4 py-3 bg-card"
                    />
                </div>
            </Modal>

            <Section spacing="lg" className="space-y-2">
                {isLoading && (
                    <LoadingState message="Buscando despesas..." />
                )}

                {!isLoading && filtered.length === 0 && (
                    <EmptyState message="Nenhuma despesa encontrada" />
                )}

                {!isLoading && pageItems.map((e) => (
                    <div key={e.id} className="bg-card rounded-xl p-4 border border-border space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-foreground text-sm font-normal break-word">{e.description}</p>
                                <p className="text-muted-foreground text-xs mt-1">{new Date(e.createdAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => startEdit(e)}
                                    className="bg-primary/10 text-primary px-3 py-2 rounded-lg"
                                    aria-label="Editar"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="bg-destructive/10 text-destructive px-3 py-2 rounded-lg shrink-0" aria-label="Excluir">
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
                        </div>
                        <div className="flex flex-col gap-2 pt-3 border-t border-border">
                            <span className="text-muted-foreground text-xs">{EXPENSE_CATEGORIES[e.category as keyof typeof EXPENSE_CATEGORIES] || e.category}</span>
                            <p className="text-accent text-xl tracking-tighter font-normal">-{formatCurrency(e.value)}</p>
                        </div>
                    </div>
                ))}

                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
                        <button
                            onClick={() => setPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-xs border border-border rounded-xl disabled:opacity-50 transition-colors hover:bg-muted/30"
                        >
                            Anterior
                        </button>
                        <span className="text-xs text-muted-foreground font-medium">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-xs border border-border rounded-xl disabled:opacity-50 transition-colors hover:bg-muted/30"
                        >
                            Próximo
                        </button>
                    </div>
                )}
            </Section>
        </div>
    );
}
