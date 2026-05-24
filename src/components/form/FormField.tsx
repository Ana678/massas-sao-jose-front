interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  mask?: (v: string) => string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  maxLength?: number;
  type?: string;
  className?: string;
}

export default function FormField({
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  mask,
  inputMode,
  maxLength,
  type = "text",
  className = ""
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const next = mask ? mask(raw) : raw;
    onChange(next);
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full bg-card border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            error ? "border-destructive" : "border-border"
          }`}
      />
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}
