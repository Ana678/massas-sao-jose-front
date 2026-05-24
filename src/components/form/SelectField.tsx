import SectionLabel from "@/components/form/SectionLabel";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    error?: string;
    required?: boolean;
    className?: string;
    selectClassName?: string;
}

export default function SelectField({
    label,
    value,
    onChange,
    options,
    error,
    required = false,
    className = "",
    selectClassName = ""
}: SelectFieldProps) {
    return (
        <div className={className}>
            <SectionLabel className="mb-1 block">
                {label} {required && <span className="text-destructive">*</span>}
            </SectionLabel>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${error ? "border-destructive" : ""} ${selectClassName}`}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
        </div>
    );
}
