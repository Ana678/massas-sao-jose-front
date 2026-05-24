import { useMemo, useState } from "react";
import { Plus, User, Building2, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ClientCard from "@/components/ClientCard";
import PhoneButton from "@/components/PhoneButton";
import SearchInput from "@/components/form/SearchInput";
import SegmentedControl from "@/components/form/SegmentedControl";
import EmptyState from "@/components/layout/EmptyState";
import LoadingState from "@/components/layout/LoadingState";
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

    const tabs = [
        { key: "all", label: "Todos", icon: Users, count: counts.all },
        { key: "person", label: "Pessoas", icon: User, count: counts.person },
        { key: "business", label: "Empresas", icon: Building2, count: counts.business },
    ];


    if (isLoading) return <LoadingState message="Carregando clientes..." className="h-screen" />;


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
                <SearchInput
                    placeholder="Buscar nome, razão social ou cidade..."
                    value={search}
                    onChange={setSearch}
                />
            </section>
            {/* Filter tabs */}
            <section className="px-6 pb-4">
                <SegmentedControl
                    tabs={tabs}
                    activeKey={filter}
                    onChange={(key) => setFilter(key as Filter)}
                />
            </section>
            {/* Client list */}
            {
                filtered.length === 0 ? (
                    <EmptyState message="Nenhum cliente encontrado" />
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
