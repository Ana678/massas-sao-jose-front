import { useState } from "react";
import { TrendingDown, ArrowRight, History, BarChart, Cookie } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
    getOrders, getExpenses, formatCurrency
} from "@/lib/data";
import { Link } from "@tanstack/react-router";

export default function WalletPage() {
    const [orders] = useState(getOrders());
    const [expenses] = useState(getExpenses());

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthOrders = orders.filter((o) => o.createdAt.startsWith(thisMonth) && o.status === "concluido");
    const monthExpenses = expenses.filter((e) => e.date.startsWith(thisMonth));

    const revenue = monthOrders.reduce((s, o) => s + o.total, 0);
    const costs = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const profit = revenue - costs;

    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(today) && o.status === "concluido");
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);

    return (
        <>
            <PageHeader title="Caixa" subtitle="Visão financeira" />

            {/* Main card */}
            <section className="px-6 py-2">
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1.5">Sobrou no caixa</p>
                    <p className={`text-4xl tracking-tighter font-normal ${profit >= 0 ? "text-primary" : "text-accent"}`}>
                        {formatCurrency(profit)}
                    </p>
                    <div className="border-t border-border mt-5 pt-5 flex justify-between items-center">
                        <div>
                            <p className="text-muted-foreground text-xs mb-1 tracking-wide">Entrou</p>
                            <p className="text-foreground text-sm font-normal">{formatCurrency(revenue)}</p>
                        </div>
                        <div className="w-px h-8 bg-border"></div>
                        <div className="text-right">
                            <p className="text-muted-foreground text-xs mb-1 tracking-wide">Saiu</p>
                            <p className="text-foreground text-sm font-normal">{formatCurrency(costs)}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Today */}
            <section className="px-6 py-2">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Hoje</p>
                    <p className="text-primary text-2xl tracking-tighter font-normal">{formatCurrency(todayRevenue)}</p>
                    <p className="text-muted-foreground text-xs mt-1">{todayOrders.length} pedidos concluídos</p>
                </div>
            </section>

            {/* Actions */}
            <section className="px-6 py-4 space-y-3">
                <Link
                    to="/expenses">
                    <button
                        className="w-full mb-3 bg-card text-foreground rounded-2xl p-4 flex items-center justify-between border border-border transition-transform active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <TrendingDown className="w-5 h-5 text-accent" />
                            <span className="font-normal">Lançar Despesa</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                </Link>

                <Link
                    to="/orders">
                    <button
                        className="w-full mb-3 bg-card text-foreground rounded-2xl p-4 flex items-center justify-between border border-border transition-transform active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-primary" />
                            <span className="font-normal">Histórico de Pedidos</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                </Link>


                <Link
                    to="/finance">
                    <button
                        className="w-full mb-3 bg-card text-foreground rounded-2xl p-4 flex items-center justify-between border border-border transition-transform active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <BarChart className="w-5 h-5 text-primary" />
                            <span className="font-normal">Dashboard Financeiro</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                </Link>


                <Link
                    to="/products">

                    <button
                        className="w-full bg-card text-foreground rounded-2xl p-4 flex items-center justify-between border border-border transition-transform active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <Cookie className="w-5 h-5 text-primary" />
                            <span className="font-normal">Gerenciar Produtos</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>

                </Link>
            </section>
        </>
    );
}
