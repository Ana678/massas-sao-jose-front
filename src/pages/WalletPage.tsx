import { Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, ArrowRight, FileDown, AlertCircle, Wallet, CalendarDays, History, Cookie } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { exportMonthlyClosingPDF } from "@/lib/make-pdf";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useOrdersList } from "@/lib/hooks/useOrders";
import { useExpensesList } from "@/lib/hooks/useExpenses";

export default function CaixaPage() {
    const { data: orders = [] } = useOrdersList();
    const { data: expenses = [] } = useExpensesList();

    const thisMonth = new Date().toISOString().slice(0, 7);


    const monthOrders = orders.filter((o) => o.createdAt.startsWith(thisMonth) && o.isPaid);
    const monthExpenses = expenses.filter((e) => e.createdAt.startsWith(thisMonth));

    const revenue = monthOrders.reduce((s, o) => s + Number(o.total), 0);
    const costs = monthExpenses.reduce((s, e) => s + Number(e.value), 0);
    const profit = revenue - costs;

    const today = new Date().toISOString().slice(0, 10);


    const todayOrders = orders.filter((o) => o.createdAt.startsWith(today) && o.isPaid);
    const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);

    const pendingPaymentOrders = orders.filter((o) => !o.isPaid);
    const pendingPaymentTotal = pendingPaymentOrders.reduce((s, o) => s + Number(o.total), 0);
    const isPositive = profit >= 0;

    async function handleClosing() {
        try {
            await exportMonthlyClosingPDF(monthOrders, monthExpenses, thisMonth);
            toast.success("Fechamento gerado!");
        } catch (e) {
            console.error(e);
            toast.error("Erro ao gerar PDF");
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
                        className="bg-primary text-primary-foreground px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow-sm transition-transform active:scale-[0.98]"
                        aria-label="Fechamento mensal PDF"
                    >
                        <FileDown className="w-4 h-4" />
                        Fechamento
                    </button>
                }
            />

            <section className="px-6 py-2">
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-border bg-secondary/45">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Saldo do mês</p>
                                <p className={`text-4xl tracking-tight font-display leading-none ${isPositive ? "text-primary" : "text-destructive"}`}>
                                    {formatCurrency(profit)}
                                </p>
                            </div>
                            <div className={`rounded-xl px-3 py-2 text-xs border ${isPositive ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                                {isPositive ? "Caixa positivo" : "Atenção ao caixa"}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-border text-muted-foreground">
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-widest">Entrou</span>
                            </div>
                            <p className="text-lg font-normal tracking-tight text-primary/70">{formatCurrency(revenue)}</p>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-widest">Saiu</span>
                            </div>
                            <p className="text-lg font-normal tracking-tight text-destructive/70">- {formatCurrency(costs)}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-2">
                <div className="bg-secondary/40 rounded-xl p-4 border border-border flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-normal">Vendas de hoje</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{todayOrders.length} pedidos concluídos</p>
                    </div>
                    <p className="text-primary text-xl tracking-tight font-normal whitespace-nowrap">{formatCurrency(todayRevenue)}</p>
                </div>
            </section>

            {pendingPaymentOrders.length > 0 && (
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
                                        {pendingPaymentOrders.length} pedidos entregues • {formatCurrency(pendingPaymentTotal)} em aberto
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
