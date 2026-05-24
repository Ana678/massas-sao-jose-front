interface DualStatCardProps {
  left: {
    label: string;
    value: React.ReactNode;
    variant?: "default" | "success" | "destructive" | "warning";
    icon?: React.ComponentType<{ className?: string }>;
  };
  right: {
    label: string;
    value: React.ReactNode;
    variant?: "default" | "success" | "destructive" | "warning";
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

export default function DualStatCard({ left, right, className = "" }: DualStatCardProps) {
  const getVariantClass = (variant: string = "default") => {
    const variantMap = {
      default: "text-primary",
      success: "text-green-700",
      destructive: "text-destructive",
      warning: "text-yellow-700"
    };
    return variantMap[variant as keyof typeof variantMap] || variantMap.default;
  };

  const StatItem = ({
    label,
    value,
    variant = "default",
    icon: Icon
  }: {
    label: string;
    value: React.ReactNode;
    variant?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="flex-1 flex flex-col items-start gap-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="flex items-center gap-2 w-full">
        {Icon && (
          <Icon className={`w-4 h-4 shrink-0 ${getVariantClass(variant)}`} />
        )}
        <p className={`text-lg font-normal tracking-tight ${getVariantClass(variant)}`}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`bg-card rounded-xl p-4 border border-border grid grid-cols-2 gap-4 divide-x divide-border ${className}`}>
      <StatItem {...left} />
      <StatItem {...right} />
    </div>
  );
}
