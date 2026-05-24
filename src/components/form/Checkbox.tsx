interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  description,
  className = "",
  disabled = false
}: CheckboxProps) {
  return (
    <label className={`flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 cursor-pointer transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : `hover:bg-card/80`} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
      />
      {label && (
        <div>
          <span className="text-foreground text-sm">{label}</span>
          {description && (
            <p className="text-muted-foreground text-xs mt-0.5">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}
