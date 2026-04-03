import { useState } from "react";
import { Plus, Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getExpenses, saveExpenses, generateId, formatCurrency, EXPENSE_CATEGORIES, type Expense } from "@/lib/data";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState(getExpenses());
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ description: "", amount: 0, category: "insumos" as Expense["category"] });

    function submit() {
        if (!form.description || form.amount <= 0) return;
        const expense: Expense = {
            id: generateId(),
            ...form,
            date: new Date().toISOString(),
        };
        const updated = [...expenses, expense];
        setExpenses(updated);
        saveExpenses(updated);
        setShowForm(false);
        setForm({ description: "", amount: 0, category: "insumos" });
    }

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthExpenses = expenses.filter((e) => e.date.startsWith(thisMonth));
    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);

    return (
        <>
            <PageHeader
                title="Despesas"
                subtitle={`Total mês: ${formatCurrency(total)}`}
                backTo="/caixa"
                rightAction={
                    <button onClick={() => setShowForm(!showForm)} className="bg-accent text-accent-foreground p-2 rounded-xl">
                        <Plus className="w-5 h-5" />
                    </button>
                }
            />

            {showForm && (
                <section className="px-6 pb-4">
                    <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
                        <input
                            placeholder="Descrição (ex: Farinha de trigo)"
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <input
                            type="number"
                            placeholder="Valor (R$)"
                            value={form.amount || ""}
                            onChange={(e) => setForm((f) => ({ ...f, amount: +e.target.value }))}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        <select
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Expense["category"] }))}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none"
                        >
                            {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <button
                            onClick={submit}
                            className="w-full bg-accent text-accent-foreground rounded-xl p-3 flex items-center justify-center gap-2 font-normal"
                        >
                            <Check className="w-4 h-4" />
                            Lançar Despesa
                        </button>
                    </div>
                </section>
            )}

            <section className="px-6 pb-6 space-y-2">
                {monthExpenses.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">Nenhuma despesa este mês</p>
                )}
                {monthExpenses.reverse().map((e) => (
                    <div key={e.id} className="bg-card rounded-xl p-3 border border-border flex justify-between items-center">
                        <div>
                            <p className="text-foreground text-sm font-normal">{e.description}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">
                                {EXPENSE_CATEGORIES[e.category]} • {new Date(e.date).toLocaleDateString("pt-BR")}
                            </p>
                        </div>
                        <p className="text-accent text-sm font-normal">-{formatCurrency(e.amount)}</p>
                    </div>
                ))}
            </section>
        </>
    );
}
