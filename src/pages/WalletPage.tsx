import { Link } from "@tanstack/react-router";
import { toDateStr, toMonthStr } from "@/lib/date";
import { TrendingUp, TrendingDown, ArrowRight, FileDown, AlertCircle, Wallet, CalendarDays, History, Cookie } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { exportMonthlyClosingPDF } from "@/lib/make-pdf";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useDashboardSummary, useExportOrders } from "@/lib/hooks/useOrders";
import { useExpensesList } from "@/lib/hooks/useExpenses";
import StatCard from "@/components/ui/StatCard";
import DualStatCard from "@/components/ui/DualStatCard";

export default function CaixaPage() {
    const today = toDateStr();
    const thisMonth = toMonthStr();
    const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    const monthStart = `${thisMonth}-01`;
    const monthEnd = `${thisMonth}-${lastDayOfMonth}`;

    const { data: summary } = useDashboardSummary(monthStart, monthEnd, today);
    const { data: expenses = [] } = useExpensesList();

    const monthExpenses = expenses.filter((e) => e.createdAt.startsWith(thisMonth));
    const costs = monthExpenses.reduce((s, e) => s + Number(e.value), 0);

    const revenue = summary?.monthRevenue || 0;
    const profit = revenue - costs;
    const isPositive = profit >= 0;

    const exportMutation = useExportOrders();

    async function handleClosing() {
        try {
            toast.loading("Reunindo dados do mês...", { id: "pdf-toast" });

            const orders = await exportMutation.mutateAsync({
                startDate: monthStart,
                endDate: monthEnd,
                status: "ENTREGUE"
            });

            await exportMonthlyClosingPDF(orders, monthExpenses, thisMonth);
            toast.success("Fechamento gerado!", { id: "pdf-toast" });
        } catch (e) {
            console.error(e);
            toast.error("Erro ao gerar PDF", { id: "pdf-toast" });
        }
    }

    return (
        <>
            <PageHeader
                title="Caixa"
                subtitle="Resumo do dinheiro que entrou e saiu"
                rightAction={
                    <button
                        onClick={handleClosing}
                        className="bg-primary text-primary-foreground px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow-sm"
                    >
                        <FileDown className="w-4 h-4" />
                        Fechamento
                    </button>
                }
            />

            <section className="px-6 py-2">
                <StatCard label="Saldo do mês" value={formatCurrency(profit)} variant={isPositive ? "success" : "destructive"} />
            </section>

            <section className="px-6 py-2">
                <DualStatCard
                    left={{
                        label: "Entrou",
                        value: formatCurrency(revenue),
                        icon: TrendingUp,
                        variant: "success"
                    }}
                    right={{
                        label: "Saiu",
                        value: formatCurrency(costs),
                        icon: TrendingDown,
                        variant: "destructive"
                    }}
                />
            </section>

            <section className="px-6 py-2">
                <div className="bg-secondary/40 rounded-xl p-4 border border-border flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-normal">Vendas de hoje</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{summary?.todayOrdersCount || 0} pedidos concluídos</p>
                    </div>
                    <p className="text-primary text-xl tracking-tight font-normal whitespace-nowrap">{formatCurrency(summary?.todayRevenue || 0)}</p>
                </div>
            </section>

            {(summary?.pendingOrdersCount || 0) > 0 && (
                <section className="px-6 py-2">
                    <Link to="/orders">
                        <button
                            className="w-full bg-accent/10 text-foreground rounded-xl p-4 border border-accent/30 flex items-center justify-between gap-3 text-left transition-transform active:scale-[0.98]"
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <AlertCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-normal">Recebimentos em aberto</p>
                                    <p className="text-pretty/80 text-xs mt-1">
                                        {summary?.pendingOrdersCount || 0} pedidos entregues • {formatCurrency(summary?.pendingPaymentTotal || 0)} em aberto
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                        </button>
                    </Link>
                </section>
            )}

            <section className="px-6 py-4">
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-3">Ações rápidas</p>
                <div className="grid grid-cols-2 gap-3">

                    <Link
                        to="/expenses">
                        <button
                            className="bg-card w-full text-foreground rounded-xl p-4 flex flex-col items-start gap-3 border border-border transition-transform active:scale-[0.98]"
                        >
                            <TrendingDown className="w-5 h-5 text-primary/50" />
                            <span className="font-normal text-left leading-tight">Lançar despesa</span>
                        </button>
                    </Link>

                    <Link
                        to="/orders">
                        <button
                            className="bg-card w-full text-foreground rounded-xl p-4 flex flex-col items-start gap-3 border border-border transition-transform active:scale-[0.98]"
                        >
                            <History className="w-5 h-5 text-primary/50" />
                            <span className="font-normal text-left leading-tight">Histórico de pedidos</span>
                        </button>
                    </Link>


                    <Link
                        to="/finance">
                        <button
                            className="bg-card w-full text-foreground rounded-xl p-4 flex flex-col items-start gap-3 border border-border transition-transform active:scale-[0.98]"
                        >
                            <Wallet className="w-5 h-5 text-primary/50" />
                            <span className="font-normal text-left leading-tight">Dashboard financeiro</span>
                        </button>
                    </Link>
                    <Link
                        to="/products">
                        <button
                            className="bg-card w-full text-foreground rounded-xl p-4 flex flex-col items-start gap-3 border border-border transition-transform active:scale-[0.98]"
                        >
                            <Cookie className="w-5 h-5 text-primary/50" />

                            <span className="font-normal text-left leading-tight">Gerenciar produtos</span>
                        </button>
                    </Link>
                </div>
            </section>
        </>
    );
}
