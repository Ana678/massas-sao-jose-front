import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ClientForm, { emptyClientForm, validateClientForm, type ClientFormValues } from "@/components/ClientForm";
import type { ClientFormType } from "@/lib/clientSchema";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSaveClient } from "@/lib/hooks/useClients";
import { useFormError } from "@/hooks/useFormError";
import FormSubmitButton from "@/components/form/FormSubmitButton";

export default function NovoClientePage() {

    const navigate = useNavigate();
    const { mutate: saveClient, isPending } = useSaveClient();
    const { errors, mapErrors } = useFormError();

    const [type, setType] = useState<ClientFormType>("simple");
    const [values, setValues] = useState<ClientFormValues>(emptyClientForm);

    function submit() {
        const result = validateClientForm(values, type);
        if (!result.ok) {
            mapErrors({ response: { data: { fieldErrors: result.errors } } });
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

        saveClient(clientPayload, {
            onSuccess: () => {
                toast.success("Cliente cadastrado com sucesso!");
                navigate({ to: '/clients' });
            },
            onError: (error: any) => {
                // Map field mapping for API response
                const fieldMapping = {
                    cityId: "city",
                    needsInvoice: "needFiscalNote",
                };
                mapErrors(error, fieldMapping);

                if (Object.keys(errors).length > 0) {
                    toast.error("Corrija os campos destacados");
                    return;
                }

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
                    onTypeChange={(t) => { setType(t); }}
                    values={values}
                    onChange={setValues}
                    errors={errors}
                />

                <FormSubmitButton
                    onClick={submit}
                    loading={isPending}
                    disabled={isPending}
                    variant="primary"
                >
                    Cadastrar Cliente
                </FormSubmitButton>
            </section>
        </>
    );
}
