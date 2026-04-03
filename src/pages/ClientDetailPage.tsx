import { useState } from "react";
import { FileText, Edit2, Check, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PhoneButton from "@/components/PhoneButton";
import AddressLink from "@/components/AddressLink";
import StatusBadge from "@/components/StatusBadge";
import { getClients, saveClients, getOrders, getProducts, formatCurrency, clientNeedsInvoice, type Client } from "@/lib/data";
import { toast } from "sonner";

interface ClientDetailPageProps {

    id: string;

}

export default function ClientDetailPage({ id }: ClientDetailPageProps) {

    const [clients, setClients] = useState(getClients());
    const [orders] = useState(getOrders());
    const [products] = useState(getProducts());
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Partial<Client>>({});

    const client = clients.find((c) => c.id === id);
    if (!client) return <div className="p-6">Cliente não encontrado</div>;

    const clientOrders = orders.filter((o) => o.clientId === client.id);
    const hasNF = clientNeedsInvoice(client);

    function startEditing() {
        setForm({ ...client });
        setEditing(true);
    }

    function saveEdit() {
        if (!form.name || !form.cidade) return;
        const updated = clients.map((c) => (c.id === id ? { ...c, ...form } : c));
        saveClients(updated);
        setClients(updated);
        setEditing(false);
        toast.success("Cliente atualizado!");
    }

    function set(key: string, value: string | boolean) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <>
            <PageHeader
                title={client.name}
                subtitle={client.razaoSocial}
                backTo="/clientes"
                rightAction={
                    !editing ? (
                        <button onClick={startEditing} className="bg-primary/10 text-primary p-2 rounded-xl">
                            <Edit2 className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setEditing(false)} className="bg-card text-muted-foreground p-2 rounded-xl border border-border">
                                <X className="w-5 h-5" />
                            </button>
                            <button onClick={saveEdit} className="bg-primary text-primary-foreground p-2 rounded-xl">
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    )
                }
            />

            <section className="px-6 space-y-4 pb-6">
                {editing ? (
                    <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
                        {[
                            { key: "name", label: "Nome / Fantasia" },
                            { key: "phone", label: "Telefone" },
                            { key: "email", label: "Email" },
                            { key: "cpfCnpj", label: "CPF / CNPJ" },
                            { key: "razaoSocial", label: "Razão Social" },
                            { key: "inscricaoEstadual", label: "Inscrição Estadual" },
                            { key: "cep", label: "CEP" },
                            { key: "endereco", label: "Endereço" },
                            { key: "cidade", label: "Cidade" },
                            { key: "estado", label: "Estado" },
                        ].map((f) => (
                            <div key={f.key}>
                                <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">{f.label}</label>
                                <input
                                    type="text"
                                    value={(form as { [key: string]: string })[f.key] || ""}
                                    onChange={(e) => set(f.key, e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        ))}
                        <label className="flex items-center gap-3 cursor-pointer pt-2">
                            <input
                                type="checkbox"
                                checked={form.needsInvoice || false}
                                onChange={(e) => set("needsInvoice", e.target.checked)}
                                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-foreground text-sm">Cliente precisa de Nota Fiscal</span>
                        </label>
                    </div>
                ) : (
                    <>
                        {/* Info card */}
                        <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-normal">{client.cpfCnpj}</span>
                                </div>
                                {hasNF && (
                                    <span className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                        NF
                                    </span>
                                )}
                            </div>
                            {client.inscricaoEstadual && (
                                <div className="flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <span>IE: {client.inscricaoEstadual}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <PhoneButton phone={client.phone} size="md" />
                                <span className="text-muted-foreground text-sm">{client.phone}</span>
                            </div>
                            <AddressLink client={client} />
                            {client.email && <p className="text-muted-foreground text-xs">{client.email}</p>}
                        </div>
                    </>
                )}

                {/* Average order */}
                {!editing && client.averageOrder && Object.keys(client.averageOrder).length > 0 && (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Pedido Médio</p>
                        <div className="space-y-1">
                            {Object.entries(client.averageOrder).map(([pid, qty]) => {
                                const p = products.find((x) => x.id === pid);
                                return p ? (
                                    <p key={pid} className="text-foreground text-sm">
                                        {p.icon} {qty}{p.unit} {p.name}
                                    </p>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {/* Orders history */}
                {!editing && (
                    <div>
                        <h2 className="font-display text-lg tracking-tight mb-3">Histórico de Compras</h2>
                        {clientOrders.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Nenhuma compra registrada</p>
                        ) : (
                            <div className="space-y-2">
                                {clientOrders.slice(0, 10).map((o) => (
                                    <div key={o.id} className="bg-card rounded-xl p-3 border border-border">
                                        <div className="flex justify-between items-center">
                                            <p className="text-foreground text-sm font-normal">{formatCurrency(o.total)}</p>
                                            <StatusBadge status={o.status} />
                                        </div>
                                        <p className="text-muted-foreground text-xs mt-1">
                                            {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </>
    );
}
