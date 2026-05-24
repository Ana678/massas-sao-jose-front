interface BadgeProps {
    variant?: "default" | "primary" | "success" | "destructive" | "warning";
    children: React.ReactNode;
    className?: string;
}

export default function Badge({
    variant = "default",
    children,
    className = ""
}: BadgeProps) {
    const variantClass = {
        default: "bg-card text-foreground border-border",
        primary: "bg-primary/10 text-primary border-primary/30",
        success: "bg-green-500/10 text-green-700 border-green-500/30",
        destructive: "bg-destructive/10 text-destructive border-destructive/30",
        warning: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30"
    }[variant];

    return (
        <span
            className={`inline-block text-[9px] uppercase tracking-wider py-0.5 px-1.5 rounded font-medium border ${variantClass} ${className}`}
        >
            {children}
        </span>
    );
}
