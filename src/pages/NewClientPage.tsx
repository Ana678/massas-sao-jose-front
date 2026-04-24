import { useState } from "react";
import { Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ClientForm, { emptyClientForm, validateClientForm, type ClientFormValues } from "@/components/ClientForm";
import type { ClientFormType } from "@/lib/clientSchema";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSaveClient } from "@/lib/hooks/useClients";

export default function NovoClientePage() {

    const navigate = useNavigate();
    const { mutate: saveClient, isPending } = useSaveClient();

    const [type, setType] = useState<ClientFormType>("simple");
    const [values, setValues] = useState<ClientFormValues>(emptyClientForm);
    const [errors, setErrors] = useState<Partial<Record<keyof ClientFormValues, string>>>({});

    function submit() {
        const result = validateClientForm(values, type);
        if (!result.ok) {
            setErrors(result.errors);
            toast.error("Verifique os campos destacados");
            return;
        }
        setErrors({});

        const clientPayload = {

            name: values.name.trim(),
            phone: values.phone.trim(),
            city: values.city.trim(),
            state: values.state.trim().toUpperCase(),
            address: values.address.trim(),

            cep: values.cep.trim() || undefined,
            cnpj: values.cnpj.trim() || undefined,
            socialReason: type === "business" ? values.socialReason.trim() || undefined : undefined,
            stateInscription: type === "business" ? values.stateInscription.trim() || undefined : undefined,
            needFiscalNote: values.needFiscalNote || false,

        };

        saveClient(clientPayload, {
            onSuccess: () => {
                toast.success("Cliente cadastrado com sucesso!");
                navigate({ to: '/clients' });
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Erro ao cadastrar cliente");
            }
        });
    }

    return (
        <>
            <PageHeader title="Novo Cliente" backTo="/clients" />

            <section className="px-6 pb-6 space-y-4">
                <ClientForm
                    type={type}
                    onTypeChange={(t) => { setType(t); setErrors({}); }}
                    values={values}
                    onChange={setValues}
                    errors={errors}
                />

                <button
                    onClick={submit}
                    disabled={isPending}
                    className="w-full bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-center gap-2 font-normal mt-2 transition-transform active:scale-[0.98]"
                >
                    <Check className="w-5 h-5" />
                    {isPending ? "Salvando..." : "Cadastrar Cliente"}
                </button>
            </section>
        </>
    );
}
