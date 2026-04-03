import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { getOrders, getExpenses, formatCurrency, EXPENSE_CATEGORIES } from "@/lib/data";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function FinanceDashboardPage() {
    const [orders] = useState(getOrders());
    const [expenses] = useState(getExpenses());

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthOrders = orders.filter((o) => o.createdAt.startsWith(thisMonth) && o.status === "concluido");
    const monthExpenses = expenses.filter((e) => e.date.startsWith(thisMonth));

    const revenue = monthOrders.reduce((s, o) => s + o.total, 0);
    const costs = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const profit = revenue - costs;

    // Last 7 days chart
    const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
        const dayRevenue = orders
            .filter((o) => o.createdAt.startsWith(key) && o.status === "concluido")
            .reduce((s, o) => s + o.total, 0);
        const dayExpense = expenses
            .filter((e) => e.date.startsWith(key))
            .reduce((s, e) => s + e.amount, 0);
        return { name: dayLabel, receita: dayRevenue, despesa: dayExpense };
    });

    // Expense by category
    const byCategory: Record<string, number> = {};
    monthExpenses.forEach((e) => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    return (
        <>
            <PageHeader title="Dashboard" subtitle="Visão financeira do mês" backTo="/caixa" />

            {/* Summary cards */}
            <section className="px-6 py-2 space-y-3">
                <div className="bg-card rounded-2xl p-5 border border-border">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Lucro Líquido</p>
                    <p className={`text-4xl tracking-tighter font-normal ${profit >= 0 ? "text-primary" : "text-accent"}`}>
                        {formatCurrency(profit)}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card rounded-xl p-4 border border-border">
                        <p className="text-muted-foreground text-xs mb-1">Faturamento</p>
                        <p className="text-primary text-xl tracking-tighter font-normal">{formatCurrency(revenue)}</p>
                        <p className="text-muted-foreground text-xs mt-1">{monthOrders.length} pedidos</p>
                    </div>
                    <div className="bg-card rounded-xl p-4 border border-border">
                        <p className="text-muted-foreground text-xs mb-1">Custos</p>
                        <p className="text-accent text-xl tracking-tighter font-normal">{formatCurrency(costs)}</p>
                        <p className="text-muted-foreground text-xs mt-1">{monthExpenses.length} lançamentos</p>
                    </div>
                </div>
            </section>

            {/* Chart */}
            <section className="px-6 py-4">
                <h2 className="font-display text-lg tracking-tight mb-3">Últimos 7 dias</h2>
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(36, 18%, 62%)" }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ background: "hsl(36, 33%, 93%)", border: "1px solid hsl(36, 18%, 62%, 0.3)", borderRadius: "8px", fontSize: 12 }}
                            />
                            <Bar dataKey="receita" fill="hsl(136, 22%, 30%)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="despesa" fill="hsl(7, 58%, 42%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-success-foreground"></div>
                            <span className="text-muted-foreground text-xs">Receita</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-accent"></div>
                            <span className="text-muted-foreground text-xs">Despesa</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="px-6 py-2 pb-6">
                <h2 className="font-display text-lg tracking-tight mb-3">Despesas por Categoria</h2>
                <div className="space-y-2">
                    {Object.entries(byCategory).map(([cat, amount]) => (
                        <div key={cat} className="bg-card rounded-xl p-3 border border-border flex justify-between items-center">
                            <span className="text-foreground text-sm font-normal">{EXPENSE_CATEGORIES[cat as keyof typeof EXPENSE_CATEGORIES]}</span>
                            <span className="text-accent text-sm font-normal">{formatCurrency(amount)}</span>
                        </div>
                    ))}
                    {Object.keys(byCategory).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">Nenhuma despesa lançada</p>
                    )}
                </div>
            </section>
        </>
    );
}
