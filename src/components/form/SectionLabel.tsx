interface SectionLabelProps {
    children: React.ReactNode;
    className?: string;
}

export default function SectionLabel({ children, className = "" }: SectionLabelProps) {
    return (
        <label className={`text-muted-foreground text-xs uppercase tracking-widest ${className}`}>
            {children}
        </label>
    );
}
