import { CreditCard, DollarSign, QrCode } from "lucide-react";

interface PaymentSelectorProps {
    value: "dinheiro" | "pix" | "cartao";
    onChange: (method: "dinheiro" | "pix" | "cartao") => void;
}

const methods = [
    { key: "dinheiro" as const, label: "Dinheiro", icon: DollarSign },
    { key: "pix" as const, label: "Pix", icon: QrCode },
    { key: "cartao" as const, label: "Cartao", icon: CreditCard },
];

export default function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
    return (
        <div className="flex gap-2">
            {methods.map((m) => {
                const Icon = m.icon;
                return (
                    <button
                        key={m.key}
                        onClick={() => onChange(m.key)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-normal border transition-colors ${value === m.key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border"
                            }`}
                    >
                        <span className="inline-flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5" />
                            {m.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
