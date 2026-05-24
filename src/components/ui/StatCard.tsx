interface StatCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  variant?: "default" | "success" | "destructive" | "warning";
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  variant = "default",
  icon: Icon,
  className = ""
}: StatCardProps) {
  const variantClass = {
    default: "text-primary",
    success: "text-green-700",
    destructive: "text-destructive",
    warning: "text-yellow-700"
  }[variant];

  return (
    <div className={`bg-card rounded-xl p-4 border border-border ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
            {label}
          </p>
          <p className={`text-2xl tracking-tighter font-normal ${variantClass}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${variantClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
