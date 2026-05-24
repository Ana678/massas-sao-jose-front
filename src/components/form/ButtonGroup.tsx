interface ButtonGroupOption {
    key: string;
    label: string;
}

interface ButtonGroupProps {
    options: ButtonGroupOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
    className?: string;
}

export default function ButtonGroup({
    options,
    value,
    onChange,
    multiple = false,
    className = ""
}: ButtonGroupProps) {
    const isArray = Array.isArray(value);
    const selected = isArray ? value : [value];

    const handleClick = (optionKey: string) => {
        if (multiple) {
            const newValue = selected.includes(optionKey)
                ? selected.filter(k => k !== optionKey)
                : [...selected, optionKey];
            onChange(newValue);
        } else {
            onChange(optionKey);
        }
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {options.map((option) => {
                const isSelected = selected.includes(option.key);
                return (
                    <button
                        key={option.key}
                        onClick={() => handleClick(option.key)}
                        className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
                            isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-foreground border-border"
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
