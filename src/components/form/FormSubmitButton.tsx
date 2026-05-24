import { Check, Loader2 } from "lucide-react";

interface FormSubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "accent" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
}

export default function FormSubmitButton({
  onClick,
  disabled = false,
  loading = false,
  children,
  icon: Icon = Check,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = true
}: FormSubmitButtonProps) {
  const variantClass = {
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground"
  }[variant];

  const sizeClass = {
    sm: "p-2 text-xs rounded-lg",
    md: "p-3.5 text-sm rounded-xl",
    lg: "p-4 text-base rounded-2xl"
  }[size];

  const widthClass = fullWidth ? "w-full" : "auto";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${widthClass} ${variantClass} ${sizeClass}
        flex items-center justify-center gap-2 font-normal
        disabled:opacity-40 transition-transform active:scale-[0.98]
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Salvando...
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          {children}
        </>
      )}
    </button>
  );
}
