import { useState } from "react";
import { Building, Check, Home } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { getClients, saveClients, generateId, ALL_CITIES, type Client } from "@/lib/data";
import { toast } from "sonner";

export default function NewClientPage() {
    const [isComplex, setIsComplex] = useState(false);
    const [needsInvoice, setNeedsInvoice] = useState(false);
    const [form, setForm] = useState({
        name: "", phone: "", email: "", cpfCnpj: "", razaoSocial: "",
        inscricaoEstadual: "", cep: "", endereco: "", cidade: "", estado: "RN",
    });

    function set(key: string, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function submit() {
        if (!form.name || !form.cidade) {
            toast.error("Nome e cidade são obrigatórios");
            return;
        }
        const client: Client = {
            id: generateId(),
            ...form,
            needsInvoice,
            // Clear business fields for simple register
            razaoSocial: isComplex ? form.razaoSocial : undefined,
            inscricaoEstadual: isComplex ? form.inscricaoEstadual : undefined,
            cpfCnpj: isComplex ? form.cpfCnpj : form.cpfCnpj || "",
        };
        const all = [...getClients(), client];
        saveClients(all);
        toast.success("Cliente cadastrado!");
    }

    const simpleFields: { key: string; label: string; placeholder: string; half?: boolean }[] = [
        { key: "name", label: "Nome / Apelido", placeholder: "Dona Maria" },
        { key: "phone", label: "Telefone (WhatsApp)", placeholder: "(84) 99999-0001" },
        { key: "cidade", label: "Cidade", placeholder: "Caicó" },
        { key: "endereco", label: "Endereço", placeholder: "Rua Principal, 100" },
        { key: "cep", label: "CEP", placeholder: "59300-000", half: true },
        { key: "estado", label: "Estado", placeholder: "RN", half: true },
    ];

    const complexFields: { key: string; label: string; placeholder: string; half?: boolean }[] = [
        { key: "name", label: "Nome / Fantasia", placeholder: "Padaria Estrela" },
        { key: "razaoSocial", label: "Razão Social", placeholder: "Padaria Estrela LTDA" },
        { key: "cpfCnpj", label: "CPF / CNPJ", placeholder: "12.345.678/0001-90" },
        { key: "inscricaoEstadual", label: "Inscrição Estadual", placeholder: "20.123.456-7" },
        { key: "phone", label: "Telefone (WhatsApp)", placeholder: "(84) 99999-0001" },
        { key: "email", label: "Email", placeholder: "contato@email.com" },
        { key: "cidade", label: "Cidade", placeholder: "Caicó" },
        { key: "endereco", label: "Endereço", placeholder: "Rua Principal, 100" },
        { key: "cep", label: "CEP", placeholder: "59300-000", half: true },
        { key: "estado", label: "Estado", placeholder: "RN", half: true },
    ];

    const fields = isComplex ? complexFields : simpleFields;

    return (
        <>
            <PageHeader title="Novo Cliente" backTo="/clients" />

            <section className="px-6 pb-6 space-y-4">
                {/* Type toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsComplex(false)}
                        className={`flex-1 py-3 rounded-xl text-sm font-normal border transition-colors justify-center flex items-center
                            ${!isComplex ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                            }`}
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Simples
                    </button>
                    <button
                        onClick={() => setIsComplex(true)}
                        className={`flex-1 py-3 rounded-xl text-sm font-normal border transition-colors justify-center flex items-center
                            ${isComplex ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                            }`}
                    >
                        <Building className="w-4 h-4 mr-2" />
                        Empresa
                    </button>
                </div>

                {/* City quick-pick */}
                <div>
                    <label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">Cidade (toque para selecionar)</label>
                    <div className="flex flex-wrap gap-2">
                        {ALL_CITIES.map((city) => (
                            <button
                                key={city}
                                onClick={() => set("cidade", city)}
                                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${form.cidade === city
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-foreground border-border"
                                    }`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fields */}
                <div className="flex flex-wrap gap-3">
                    {fields.filter(f => f.key !== "cidade").map((f) => (
                        <div key={f.key} className={f.half ? "w-[calc(50%-0.375rem)]" : "w-full"}>
                            <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">{f.label}</label>
                            <input
                                type="text"
                                value={(form as { [key: string]: string })[f.key]}
                                onChange={(e) => set(f.key, e.target.value)}
                                placeholder={f.placeholder}
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    ))}
                </div>

                {/* Needs Invoice toggle */}
                {isComplex && (
                    <label className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={needsInvoice}
                            onChange={(e) => setNeedsInvoice(e.target.checked)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div>
                            <span className="text-foreground text-sm">Cliente precisa de Nota Fiscal</span>
                            <p className="text-muted-foreground text-xs mt-0.5">Marque para clientes que exigem NF-e</p>
                        </div>
                    </label>
                )}

                <button
                    onClick={submit}
                    disabled={!form.name || !form.cidade}
                    className="w-full bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-center gap-2 font-normal disabled:opacity-50 mt-2 transition-transform active:scale-[0.98]"
                >
                    <Check className="w-5 h-5" />
                    Cadastrar Cliente
                </button>
            </section>
        </>
    );
}
