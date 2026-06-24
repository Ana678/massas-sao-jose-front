import { Check } from "lucide-react";

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
    <label
      className={`flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/30"
      } ${className}`}
    >
      <div
        className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/40 bg-background"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </div>

      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />

      {/* Textos */}
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-foreground text-sm font-medium">{label}</span>}
          {description && (
            <span className="text-muted-foreground text-xs mt-0.5">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
