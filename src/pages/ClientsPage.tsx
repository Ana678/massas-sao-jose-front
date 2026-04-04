import { useState } from "react";
import { Plus, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ClientCard from "@/components/ClientCard";
import PhoneButton from "@/components/PhoneButton";
import { getClients } from "@/lib/data";
import { Link } from '@tanstack/react-router';



export default function ClientsPage() {
    const [clients] = useState(getClients());
    const [search, setSearch] = useState("");

    const filtered = clients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.cidade.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <PageHeader
                title="Clientes"
                subtitle={`${clients.length} cadastrados`}
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
                        placeholder="Buscar cliente ou cidade..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </section>

            {/* Client list */}
            <section className="px-6 grow space-y-2">
                {filtered.map((c) => (
                    <div key={c.id} className="relative">
                        <Link
                            to="/clients/$id"
                            params={{ id: c.id }}
                        >
                            <ClientCard
                                client={c}
                            />
                            <div className="absolute top-3 right-3">
                                <PhoneButton phone={c.phone} />
                            </div>
                        </Link>
                    </div>
                ))}
            </section>
        </>
    );
}
