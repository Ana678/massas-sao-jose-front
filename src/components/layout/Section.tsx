interface SectionProps {
    children: React.ReactNode;
    className?: string;
    spacing?: "sm" | "md" | "lg";
}

export default function Section({
    children,
    className = "",
    spacing = "md"
}: SectionProps) {
    const paddingClass = {
        sm: "px-4 pb-2",
        md: "px-6 pb-4",
        lg: "px-6 pb-6"
    }[spacing];

    return (
        <section className={`${paddingClass} ${className}`}>
            {children}
        </section>
    );
}
