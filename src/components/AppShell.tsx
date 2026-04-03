import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, ClipboardList, Wallet, Users, Plus } from "lucide-react";

const tabs = [
    { path: "/", icon: MapPin, label: "Rota" },
    { path: "/production", icon: ClipboardList, label: "Produção" },
    { path: "/wallet", icon: Wallet, label: "Caixa" },
    { path: "/clients", icon: Users, label: "Clientes" },
];

type AppShellProps = {
    children?: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
    const pathname = useRouterState({ select: (state) => state.location.pathname });
    const isCaixaPage = pathname === "/caixa";
    const isNovoPedido = pathname === "/pedido/novo";

    return (
        <div className="flex items-center justify-center min-h-screen bg-app-bg p-0 md:p-4">
            <main className="w-full max-w-md bg-background min-h-screen md:min-h-[850px] relative overflow-y-auto no-scrollbar md:rounded-[2rem] shadow-2xl flex flex-col pb-24">
                {children}

                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background border-t border-border px-4 py-3 flex justify-around items-end z-50 md:rounded-b-[2rem]">
                    {tabs.map((tab, index) => {
                        const isActive = pathname === tab.path;
                        return (
                            <div key={tab.path} className="contents">
                                <Link to={tab.path}>
                                    <button
                                        className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        <span className="text-[10px] tracking-wide font-normal">{tab.label}</span>
                                    </button>
                                </Link>


                                {/* Novo Pedido button after Produção (index 1) */}
                                {index === 1 && !isCaixaPage && !isNovoPedido && (
                                    <Link
                                        to="/order/new">
                                        <button
                                            className="flex flex-col items-center gap-1 -mt-7 transition-transform active:scale-95"
                                        >
                                            <div className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg border-4 border-background">
                                                <Plus className="w-7 h-7" />
                                            </div>
                                            <span className="text-[10px] tracking-wide font-normal text-accent">Vender</span>
                                        </button>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </main>
        </div>
    );
}
