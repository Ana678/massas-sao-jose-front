import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputWithIconProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: "text" | "tel" | "email" | "numeric";
  error?: string;
  label?: string;
  className?: string;
}

export default function InputWithIcon({
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  maxLength,
  inputMode,
  error,
  label,
  className = ""
}: InputWithIconProps) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 ml-1 block text-xs uppercase tracking-widest text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Icon className="h-[18px] w-[18px] text-muted-foreground" />
        </div>
        <input
          type={isPassword && revealed ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          inputMode={inputMode}
          className={`block w-full rounded-xl border bg-card p-4 pl-11 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card/50 ${
            isPassword ? "pr-11" : ""
          } ${error ? "border-destructive" : "border-border"}`}
        />
        {isPassword && (
          <button
            // type="button" para não submeter o form ao clicar
            type="button"
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            {revealed ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}
