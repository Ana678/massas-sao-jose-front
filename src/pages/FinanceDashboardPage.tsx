import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { EXPENSE_CATEGORIES } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { exportFinancialDashboardPDF } from "@/lib/make-pdf";
import { toast } from "sonner";
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { tooltipCurrencyFormatter } from "@/lib/utils";
import { useFinanceMetrics } from "@/lib/hooks/useFinance";
import LoadingState from "@/components/layout/LoadingState";

const PIE_COLORS = [
    "hsl(136, 22%, 30%)",
    "hsl(7, 58%, 42%)",
    "hsl(36, 18%, 62%)",
    "hsl(220, 50%, 25%)",
    "hsl(40, 60%, 50%)",
];

type PresetPeriod = 3 | 6 | 12 | "custom";

const PRESETS: { value: PresetPeriod; label: string }[] = [
    { value: 3, label: "3m" },
    { value: 6, label: "6m" },
    { value: 12, label: "12m" },
    { value: "custom", label: "Personalizado" },
];

export default function FinanceDashboardPage() {
    const [period, setPeriod] = useState<PresetPeriod>(6);
    const todayKey = new Date().toISOString().slice(0, 7);
    const defaultFrom = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 5);
        return d.toISOString().slice(0, 7);
    })();
    const [customFrom, setCustomFrom] = useState<string>(defaultFrom);
    const [customTo, setCustomTo] = useState<string>(todayKey);

    // 1. Calcula o intervalo (start e end) de acordo com o botão clicado
    const { startDate, endDate } = useMemo(() => {
        if (period === "custom") {
            const f = customFrom <= customTo ? customFrom : customTo;
            const t = customFrom <= customTo ? customTo : customFrom;
            return { startDate: f, endDate: t };
        }
        const endD = new Date();
        const startD = new Date(endD.getFullYear(), endD.getMonth() - period + 1, 1);
        return {
            startDate: startD.toISOString().slice(0, 7),
            endDate: endD.toISOString().slice(0, 7)
        };
    }, [period, customFrom, customTo]);

    // 2. Traz as métricas prontas do backend
    const { data: metrics, isLoading } = useFinanceMetrics(startDate, endDate);

    // 3. Extrai os valores usando defaults vazios para evitar quebra enquanto carrega
    const periodTotals = metrics?.periodTotals || { revenue: 0, costs: 0, profit: 0, ordersCount: 0, expensesCount: 0 };
    const monthsData = metrics?.monthsData || [];

    // Associa a chave "cat" que veio do banco com o texto legível em português
    const categoryData = useMemo(() => {
        if (!metrics) return [];
        return metrics.categoryData.map((c) => ({
            name: EXPENSE_CATEGORIES[c.key as keyof typeof EXPENSE_CATEGORIES] || c.key,
            value: c.value,
            key: c.key,
        }));
    }, [metrics]);

    const totalCategoryvalue = categoryData.reduce((s, d) => s + d.value, 0);

    const periodLabel = useMemo(() => {
        if (period !== "custom") return PRESETS.find((p) => p.value === period)?.label ?? "";
        const fmt = (k: string) => {
            const [y, m] = k.split("-").map(Number);
            return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
        };
        return `${fmt(customFrom)} - ${fmt(customTo)}`;
    }, [period, customFrom, customTo]);

    async function handleExportPDF() {
        if (!metrics) return;
        try {
            await exportFinancialDashboardPDF({
                periodLabel,
                monthly: monthsData,
                totals: periodTotals,
                byCategory: categoryData.map((c) => ({
                    name: c.name,
                    value: c.value,
                    pct: totalCategoryvalue > 0 ? (c.value / totalCategoryvalue) * 100 : 0,
                })),
            });
            toast.success("PDF gerado!");
        } catch (e) {
            console.error(e);
            toast.error("Erro ao gerar PDF");
        }
    }

    return (
        <>
            <PageHeader
                title="Dashboard"
                subtitle="Visão financeira"
                backTo="/wallet"
                rightAction={
                    <button
                        onClick={handleExportPDF}
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
                        aria-label="Exportar dashboard em PDF"
                    >
                        <Download className="w-4 h-4" />
                        PDF
                    </button>
                }
            />

            <section className="px-6 pb-2">
                <div className="bg-card rounded-xl p-1 border border-border flex gap-1">
                    {PRESETS.map((p) => {
                        const active = period === p.value;
                        return (
                            <button
                                key={String(p.value)}
                                onClick={() => setPeriod(p.value)}
                                className={`flex-1 py-2 rounded-lg text-xs font-normal transition-colors ${active
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-background"
                                    }`}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>

                {period === "custom" && (
                    <div className="mt-2 bg-card rounded-xl p-3 border border-border grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1 block">De (mês)</label>
                            <input
                                type="month"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1 block">Até (mês)</label>
                            <input
                                type="month"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>
                )}
            </section>

            {isLoading ? (
                <div className="mt-12">
                    <LoadingState message="Analisando dados do período..." />
                </div>
            ) : (
                <>
                    <section className="px-6 py-2 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-card rounded-2xl p-5 border border-border">
                            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
                                Lucro Líquido • {periodLabel}
                            </p>
                            <p className={`text-4xl tracking-tighter font-normal ${periodTotals.profit >= 0 ? "text-primary" : "text-destructive"}`}>
                                {formatCurrency(periodTotals.profit)}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <p className="text-muted-foreground text-xs mb-1">Faturamento</p>
                                <p className="text-success text-xl tracking-tighter font-normal">{formatCurrency(periodTotals.revenue)}</p>
                                <p className="text-muted-foreground text-xs mt-1">{periodTotals.ordersCount} pedidos</p>
                            </div>
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <p className="text-muted-foreground text-xs mb-1">Custos</p>
                                <p className="text-destructive text-xl tracking-tighter font-normal">{formatCurrency(periodTotals.costs)}</p>
                                <p className="text-muted-foreground text-xs mt-1">{periodTotals.expensesCount} lançamentos</p>
                            </div>
                        </div>
                    </section>

                    <section className="px-6 py-4 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="font-display text-lg tracking-tight mb-3">Receita por Mês</h2>
                        <div className="bg-card rounded-2xl p-4 border border-border">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(36, 18%, 62%, 0.2)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(36, 18%, 62%)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "hsl(36, 18%, 62%)" }} axisLine={false} tickLine={false} width={40} />
                                    <Tooltip
                                        formatter={tooltipCurrencyFormatter}
                                        contentStyle={{
                                            background: "hsl(36, 33%, 93%)",
                                            border: "1px solid hsl(36, 18%, 62%, 0.3)",
                                            borderRadius: "8px",
                                            fontSize: 12,
                                        }}
                                    />
                                    <Bar dataKey="receita" fill="hsl(136, 22%, 30%)" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="despesa" fill="hsl(7, 58%, 42%)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-success" />
                                    <span className="text-muted-foreground text-xs">Receita</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-destructive" />
                                    <span className="text-muted-foreground text-xs">Despesa</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="px-6 py-2 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="font-display text-lg tracking-tight mb-3">Lucro Líquido</h2>
                        <div className="bg-card rounded-2xl p-4 border border-border">
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={monthsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(36, 18%, 62%, 0.2)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(36, 18%, 62%)" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "hsl(36, 18%, 62%)" }} axisLine={false} tickLine={false} width={40} />
                                    <Tooltip
                                        formatter={tooltipCurrencyFormatter}
                                        contentStyle={{
                                            background: "hsl(36, 33%, 93%)",
                                            border: "1px solid hsl(36, 18%, 62%, 0.3)",
                                            borderRadius: "8px",
                                            fontSize: 12,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="lucro"
                                        stroke="hsl(136, 22%, 30%)"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: "hsl(136, 22%, 30%)" }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="px-6 py-4 pb-6 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="font-display text-lg tracking-tight mb-3">Despesas por Categoria</h2>
                        {categoryData.length === 0 ? (
                            <div className="bg-card rounded-2xl p-6 border border-border">
                                <p className="text-muted-foreground text-sm text-center">Nenhuma despesa lançada no período</p>
                            </div>
                        ) : (
                            <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={85}
                                            paddingAngle={2}
                                        >
                                            {categoryData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={tooltipCurrencyFormatter}
                                            contentStyle={{
                                                background: "hsl(36, 33%, 93%)",
                                                border: "1px solid hsl(36, 18%, 62%, 0.3)",
                                                borderRadius: "8px",
                                                fontSize: 12,
                                            }}
                                        />
                                        <Legend
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: 11 }}
                                            formatter={(v) => <span className="text-muted-foreground">{v}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-2 pt-2 border-t border-border">
                                    {categoryData.map((c, i) => {
                                        const pct = totalCategoryvalue > 0 ? (c.value / totalCategoryvalue) * 100 : 0;
                                        return (
                                            <div key={c.key} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                                                    />
                                                    <span className="text-foreground">{c.name}</span>
                                                    <span className="text-muted-foreground text-xs">({pct.toFixed(0)}%)</span>
                                                </div>
                                                <span className="text-destructive font-normal">{formatCurrency(c.value)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                </>
            )}
        </>
    );
}
