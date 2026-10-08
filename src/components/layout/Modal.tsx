import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = "md"
}: ModalProps) {
    if (!isOpen) return null;

    const maxWidthClass = {
        sm: "max-w-xs",
        md: "max-w-md",
        lg: "max-w-lg"
    }[size];

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            // Fecha só no clique no fundo escuro, não em cliques dentro do conteúdo.
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={`w-full ${maxWidthClass} bg-background rounded-t-2xl max-h-[80vh] flex flex-col`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-display text-lg">{title}</h3>
                    <button onClick={onClose} aria-label="Fechar">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-4">
                    {children}
                </div>
                {footer && (
                    <div className="p-4 border-t border-border">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
