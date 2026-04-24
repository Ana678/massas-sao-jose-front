import { useMemo, useState } from "react";
import { Plus, Search, User, Building2, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ClientCard from "@/components/ClientCard";
import PhoneButton from "@/components/PhoneButton";
import { Link } from '@tanstack/react-router';
import { useClients } from "@/lib/hooks/useClients";
import { isBusinessClient } from "@/lib/clientSchema";

type Filter = "all" | "person" | "business";

export default function ClientsPage() {

    const { data: clients = [], isLoading } = useClients();
    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState<Filter>("all");

    const counts = useMemo(() => {
        const business = clients.filter(isBusinessClient).length;
        return { all: clients.length, business, person: clients.length - business };
    }, [clients]);

    const filtered = clients.filter((c) => {
        if (filter === "business" && !isBusinessClient(c)) return false;
        if (filter === "person" && isBusinessClient(c)) return false;
        const q = search.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            (c.socialReason?.toLowerCase().includes(q) ?? false)
        );
    });

    const tabs: { key: Filter; label: string; icon: typeof Users; count: number }[] = [
        { key: "all", label: "Todos", icon: Users, count: counts.all },
        { key: "person", label: "Pessoas", icon: User, count: counts.person },
        { key: "business", label: "Empresas", icon: Building2, count: counts.business },
    ];


    if (isLoading) return <div className="h-[100vh] flex items-center justify-center p-6 text-muted-foreground"><p>Carregando clientes...</p></div>;


    return (
        <>
            <PageHeader
                title="Clientes"
                subtitle={`${counts.all} cliente${counts.all !== 1 ? "s" : ""}`}
                rightAction={
                    <Link
                        to="/clients/new"
                        search={{ dia: undefined }}
                    >
                        <button
                            className="bg-primary text-primary-foreground p-2 rounded-xl"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </Link>
                }
            />

            {/* Search */}
            <section className="px-6 pb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar nome, razão social ou cidade..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        maxLength={80}
                        className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </section>
            {/* Filter tabs */}
            <section className="px-6 pb-4">
                <div className="flex gap-2">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const active = filter === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setFilter(t.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border transition-colors ${active
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-foreground border-border"
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{t.label}</span>
                                <span className={`text-[10px] ${active ? "opacity-80" : "text-muted-foreground"}`}>
                                    {t.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>
            {/* Client list */}
            {
                filtered.length === 0 ? (
                    <div className="h-[50vh] flex items-center justify-center p-6 text-muted-foreground">Nenhum cliente encontrado</div>
                )
                    : (
                        <section className="px-6 grow space-y-2">
                            {filtered.map((c) => (
                                <div key={c.id} className="relative">

                                    <ClientCard
                                        client={c}
                                    />
                                    <div className="absolute top-3 right-3">
                                        <PhoneButton phone={c.phone} />
                                    </div>
                                </div>
                            ))}
                        </section>
                    )
            }
        </>
    );
}
