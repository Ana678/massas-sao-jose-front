interface ButtonToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

export default function ButtonToggle({
    value,
    onChange
}: ButtonToggleProps) {
    return (
        <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
            <span className="text-sm text-foreground">Pagamento recebido na hora?</span>
            <button
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? "bg-primary" : "bg-muted"
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
}
