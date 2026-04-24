import type { Client } from "@/lib/types";
import { ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

interface ModalClientPickerProps {
    clients: Client[];
    selectedClientId?: string;
    onSelect: (client: Client) => void;
    dayParam?: string | null;
    dayCities?: string[];
}

export function ModalClientPicker({ clients, selectedClientId, onSelect, dayParam, dayCities = [] }: ModalClientPickerProps) {

    const [isOpen, setIsOpen] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");
    const [cityFilter, setCityFilter] = useState<string | null>(null);

    const selectedClient = clients.find(c => c.id === selectedClientId);

    const cities = useMemo(() => {
        const set = new Set(clients.map(c => c.city).filter(Boolean));
        return Array.from(set) as string[];
    }, [clients]);

    const filteredClients = useMemo(() => {
        let list = clients;
        if (cityFilter) {
            list = list.filter(c => c.city === cityFilter);
        }
        if (searchFilter.trim()) {
            const q = searchFilter.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
        }
        return list;
    }, [clients, searchFilter, cityFilter]);

    const handleSelect = (client: Client) => {
        onSelect(client);
        setIsOpen(false);
        setSearchFilter("");
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between text-sm"
            >
                <span className={selectedClient ? "text-foreground" : "text-muted-foreground"}>
                    {selectedClient ? `${selectedClient.name} — ${selectedClient.city}` : "Selecionar cliente..."}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Modal de Seleção */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="w-full max-w-md bg-background rounded-t-2xl h-[60vh] flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="font-display text-lg">Selecionar Cliente</h3>
                            <button onClick={() => { setIsOpen(false); setSearchFilter(""); setCityFilter(""); }}>
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Search Input Estilizado */}
                        <div className="px-4 pt-3 pb-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setCityFilter("")}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-normal border transition-colors ${!cityFilter ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                                    }`}
                            >
                                Todas
                            </button>
                            {(dayParam ? dayCities : cities).map(city => (
                                <button
                                    key={city}
                                    onClick={() => setCityFilter(city === cityFilter ? "" : city)}
                                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-normal border transition-colors ${cityFilter === city ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                                        }`}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>

                        {/* Lista de Resultados */}
                        <div className="overflow-y-auto flex-1 py-2">
                            {filteredClients.length === 0 && (
                                <p className="text-muted-foreground text-sm text-center py-6">Nenhum cliente encontrado</p>
                            )}
                            {filteredClients.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => handleSelect(c)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-card transition-colors text-left"
                                >
                                    <div>
                                        <p className="text-foreground text-sm font-normal">{c.name}</p>
                                        <p className="text-muted-foreground text-xs">{c.city} — {c.phone}</p>
                                    </div>
                                    {c.averageOrder && Object.keys(c.averageOrder).length > 0 && (
                                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Recorrente</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
