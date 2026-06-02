import { useState } from "react";
import { FileText, Edit2, Check, X, Trash2, Building2, ShoppingCart, User } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PhoneButton from "@/components/PhoneButton";
import AddressLink from "@/components/AddressLink";
import { formatCurrency } from "@/lib/utils";
import ClientForm, { type ClientFormValues } from "@/components/ClientForm";
import { isBusinessClient, type ClientFormType } from "@/lib/clientSchema";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type Client } from "@/lib/types";
import { useClient, useSaveClient } from "@/lib/hooks/useClients";
import { useDeleteClient } from "@/lib/hooks/useClients";
import { validateClientForm } from "@/components/ClientForm";
import { toast } from "sonner";
import { useFormError } from "@/hooks/useFormError";
import { useOrdersByClient } from "@/lib/hooks/useOrders";

interface ClientDetailPageProps {
    id: string;
}

function clientToForm(c: Client): ClientFormValues {
    return {
        name: c.name || "",
        phone: c.phone || "",
        cnpj: c.cnpj || "",
        socialReason: c.socialReason || "",
        stateInscription: c.stateInscription || "",
        cep: c.cep || "",
        address: c.address || "",
        city: c.city || "",
        state: c.state || "RN",
        needFiscalNote: !!c.needFiscalNote,
    };
}

export default function ClientDetailPage({ id }: ClientDetailPageProps) {

    const [editing, setEditing] = useState(false);

    const [type, setType] = useState<ClientFormType>("simple");
    const [values, setValues] = useState<ClientFormValues>(() => clientToForm({} as Client));
    const [errors, setErrors] = useState<Partial<Record<keyof ClientFormValues, string>>>({});

    const { data: client, isLoading: loadingClient, error } = useClient(id);
    const { data: clientOrders = [], error: ordersError, isLoading: isLoadingOrders } = useOrdersByClient(id);
    const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();
    const { mutate: saveClient, isPending: isSaving } = useSaveClient();
    const { mapErrors } = useFormError();


    const isBusiness = client ? isBusinessClient(client) : false;

    if (loadingClient) return <div className="h-screen flex items-center justify-center p-6 text-muted-foreground"><p>Carregando dados do cliente...</p></div>;
    if (error) return <div className="h-screen flex items-center justify-center p-6 text-muted-foreground"><p>Erro ao carregar dados do cliente. {error.message}</p></div>;
    if (!client) return <div className="h-screen flex items-center justify-center p-6 text-muted-foreground"><p>Cliente não encontrado.</p></div>;

    function startEditing() {
        setValues(clientToForm(client!));
        setType(isBusinessClient(client!) ? "business" : "simple");
        setErrors({});
        setEditing(true);
    }

    function cancelEdit() {
        setEditing(false);
        setErrors({});
    }

    function saveEdit() {
        const result = validateClientForm(values, type);
        if (!result.ok) {
            setErrors(result.errors);
            toast.error("Verifique os campos destacados");
            return;
        }

        const clientPayload = {
            name: values.name.trim(),
            phone: values.phone.trim().replace(/\D/g, ''),
            city: values.city.trim(),
            state: values.state.trim().toUpperCase(),
            address: values.address.trim(),
            cep: values.cep.trim() || undefined,
            cnpj: values.cnpj.trim() || undefined,
            socialReason: type === "business" ? values.socialReason.trim() || undefined : undefined,
            stateInscription: type === "business" ? values.stateInscription.trim() || undefined : undefined,
            needFiscalNote: values.needFiscalNote || false,
        };

        saveClient({ id, ...clientPayload }, {
            onSuccess: () => {
                toast.success("Cliente atualizado com sucesso!");
                setEditing(false);
            },
            onError: (error: any) => {
                const fieldMapping = {
                    cityId: "city",
                    needsInvoice: "needFiscalNote",
                };
                mapErrors(error, fieldMapping);
                toast.error(error.response?.data?.message || "Erro ao atualizar cliente");
            }
        });
    }

    function handleDelete() {
        deleteClient(id);
    }


    return (
        <>
            <PageHeader
                title={client.name}
                subtitle={isBusiness ? client.socialReason : client.city}
                backTo="/clientes"
                rightAction={
                    !editing ? (
                        <div className="flex gap-2">
                            <button onClick={startEditing} className="bg-primary/10 text-primary p-2 rounded-xl" aria-label="Editar">
                                <Edit2 className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={cancelEdit} className="bg-card text-muted-foreground p-2 rounded-xl border border-border" disabled={isSaving}>
                                <X className="w-5 h-5" />
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={isSaving}
                                className="bg-primary text-primary-foreground p-2 rounded-xl disabled:opacity-60 disabled:pointer-events-none">
                                <Check className="w-5 h-5" />
                            </button>
                        </div >
                    )
                }
            />

            < section className="px-6 space-y-4 pb-6" >
                {
                    editing ? (
                        <div className="flex flex-col gap-y-10">
                            <ClientForm
                                type={type}
                                onTypeChange={(t) => { setType(t); setErrors({}); }}
                                values={values}
                                onChange={setValues}
                                errors={errors}
                            />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>

                                    <button
                                        className="w-full mt-3 py-2.5 rounded-xl text-xs font-normal border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
                                        aria-label="Excluir cliente"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Excluir Cliente
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir Cliente?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação removerá <strong>{client.name}</strong> permanentemente.
                                            Essa ação não pode ser desfeita e <strong>apagará permanentemente todos os {clientOrders.length} pedido(s)</strong> associados a ele.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>


                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-60 transition-colors"
                                        >
                                            {isDeleting ? "Excluindo..." : "Excluir Cliente"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${isBusiness ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                                    }`}>
                                    {isBusiness ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                    <span className="font-medium">{isBusiness ? "Empresa" : "Pessoa"}</span>
                                </div>
                                {client.needFiscalNote && (
                                    <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                                        Emite NF
                                    </span>
                                )}
                            </div>

                            <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
                                {isBusiness && client.cnpj && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="font-normal">{client.cnpj}</span>
                                    </div>
                                )}
                                {isBusiness && client.stateInscription && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span>IE: {client.stateInscription}</span>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-3">
                                        <PhoneButton phone={client.phone} size="sm" />
                                        <span className="text-primary/70 text-sm">{client.phone}</span>
                                    </div>
                                )}
                                <AddressLink client={client} />
                            </div>

                            <div>
                                <h2 className="font-display text-lg tracking-tight mb-3">Histórico de Compras</h2>
                                {isLoadingOrders ? (
                                    <p className="text-muted-foreground text-sm">Carregando pedidos...</p>
                                ) : ordersError ? (
                                    <p className="text-destructive text-sm">Erro ao carregar pedidos: {ordersError.message}</p>
                                ) : clientOrders.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">Nenhuma compra registrada</p>
                                ) : (
                                    <div className="space-y-2">
                                        {clientOrders.slice(0, 10).map((item) => (
                                            <div key={item.id} className="bg-card rounded-xl p-3 border border-border flex gap-3">

                                                <div className="flex items-center p-2 bg-primary/5 rounded-lg radius-lg">
                                                    <ShoppingCart size={16} />
                                                </div>
                                                <div className="flex flex-col ">

                                                    <div className="flex justify-between items-center">
                                                        <p className="text-foreground text-sm font-normal">{formatCurrency(item.total)}</p>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs mt-1">
                                                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
            </section>

        </>
    );
}
