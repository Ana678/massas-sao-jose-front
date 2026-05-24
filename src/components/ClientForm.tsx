import { ALL_CITIES } from "@/lib/data";
import { getClientSchema, type ClientFormType } from "@/lib/clientSchema";
import { maskPhone, maskCEP, maskCNPJ, maskIE, maskUF } from "@/lib/masks";
import { Building, User } from "lucide-react";
import FormField from "@/components/form/FormField";
import Checkbox from "@/components/form/Checkbox";
import SectionLabel from "@/components/form/SectionLabel";

export interface ClientFormValues {
    name: string;
    phone: string;
    cnpj: string;
    socialReason: string;
    stateInscription: string;
    cep: string;
    address: string;
    city: string;
    state: string;
    needFiscalNote: boolean;
}

export const emptyClientForm: ClientFormValues = {
    name: "", phone: "", cnpj: "", socialReason: "",
    stateInscription: "", cep: "", address: "", city: "", state: "RN",
    needFiscalNote: false,
};

type Mask = (v: string) => string;

interface FieldDef {
    key: keyof ClientFormValues;
    label: string;
    placeholder: string;
    half?: boolean;
    type?: string;
    required?: boolean;
    mask?: Mask;
    inputMode?: "text" | "tel" | "email" | "numeric";
}

const SIMPLE_FIELDS: FieldDef[] = [
    { key: "name", label: "Nome", placeholder: "Dona Maria", required: true },
    { key: "phone", label: "Telefone (WhatsApp)", placeholder: "(84) 99999-0001", required: true, mask: maskPhone, inputMode: "tel" },
    { key: "cep", label: "CEP", placeholder: "00000-000", half: true, mask: maskCEP, inputMode: "numeric" },
    { key: "state", label: "Estado (UF)", placeholder: "RN", required: true, half: true, mask: maskUF },
    { key: "address", label: "Endereço", placeholder: "Rua Principal, 100", required: true },
];

const BUSINESS_FIELDS: FieldDef[] = [
    { key: "name", label: "Nome / Fantasia", placeholder: "Padaria Estrela", required: true },
    { key: "socialReason", label: "Razão Social", placeholder: "Padaria Estrela LTDA", required: true },
    { key: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00", required: true, mask: maskCNPJ, inputMode: "numeric" },
    { key: "stateInscription", label: "Inscrição Estadual", placeholder: "20.123.456-7", mask: maskIE },
    { key: "cep", label: "CEP", placeholder: "00000-000", half: true, mask: maskCEP, inputMode: "numeric" },
    { key: "state", label: "Estado (UF)", placeholder: "RN", half: true, required: true, mask: maskUF },
    { key: "phone", label: "Telefone (WhatsApp)", placeholder: "(84) 99999-0001", required: true, mask: maskPhone, inputMode: "tel" },
    { key: "address", label: "Endereço", required: true, placeholder: "Rua Principal, 100" },
];

interface Props {
    type: ClientFormType;
    onTypeChange: (t: ClientFormType) => void;
    values: ClientFormValues;
    onChange: (values: ClientFormValues) => void;
    errors: Partial<Record<keyof ClientFormValues, string>>;
    showTypeToggle?: boolean;
}

export default function ClientForm({ type, onTypeChange, values, onChange, errors, showTypeToggle = true }: Props) {
    const fields = type === "business" ? BUSINESS_FIELDS : SIMPLE_FIELDS;

    function set<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
        onChange({ ...values, [key]: value });
    }

    return (
        <div className="space-y-4">
            {showTypeToggle && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => onTypeChange("simple")}
                        className={`flex-1 py-3 rounded-xl text-sm font-normal border transition-colors justify-center flex items-center
                            ${type === "simple" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                            }`}
                    >

                        <User className="w-4 h-4 mr-2" />
                        Simples
                    </button>
                    <button
                        type="button"
                        onClick={() => onTypeChange("business")}
                        className={`flex-1 py-3 rounded-xl text-sm font-normal border transition-colors justify-center flex items-center
                            ${type === "business" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                            }`}
                    >

                        <Building className="w-4 h-4 mr-2" />
                        Empresa
                    </button>
                </div>
            )}

            <div>
                <SectionLabel className="mb-2 block">
                    Cidade <span className="text-destructive">*</span>
                </SectionLabel>
                <div className="flex flex-wrap gap-2">
                    {ALL_CITIES.map((city) => (
                        <button
                            type="button"
                            key={city}
                            onClick={() => set("city", city)}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${values.city === city
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-foreground border-border"
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
                {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
            </div>

            <div className="flex flex-wrap gap-3">
                {fields.map((f) => (
                    <div key={f.key} className={f.half ? "w-[calc(50%-0.375rem)]" : "w-full"}>
                        <FormField
                            label={f.label}
                            value={values[f.key] as string}
                            onChange={(val) => set(f.key, val as never)}
                            error={errors[f.key]}
                            placeholder={f.placeholder}
                            required={f.required}
                            mask={f.mask}
                            inputMode={f.inputMode}
                            type={f.type}
                        />
                    </div>
                ))}
            </div>

            <Checkbox
                checked={values.needFiscalNote}
                onChange={(checked) => set("needFiscalNote", checked)}
                label="Cliente precisa de Nota Fiscal"
                description="Marque para clientes que exigem NF-e"
            />
        </div>
    );
}

export function validateClientForm(values: ClientFormValues, type: ClientFormType) {
    const schema = getClientSchema(type);
    const result = schema.safeParse(values);
    if (result.success) return { ok: true as const, errors: {} as Partial<Record<keyof ClientFormValues, string>> };
    const errors: Partial<Record<keyof ClientFormValues, string>> = {};
    for (const issue of result.error.issues) {
        const k = issue.path[0] as keyof ClientFormValues;
        if (!errors[k]) errors[k] = issue.message;
    }
    return { ok: false as const, errors };
}
