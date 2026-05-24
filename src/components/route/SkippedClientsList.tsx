import { RotateCcw } from "lucide-react";
import { type Client } from "@/lib/types";

interface SkippedClientsListProps {
    clients: Client[];
    onRestore: (clientId: string) => void;
}

export function SkippedClientsList({ clients, onRestore }: SkippedClientsListProps) {
    return (
        <div className="mt-4 border-t border-border/50 pt-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
                Pulados hoje ({clients.length})
            </p>
            {clients.map(c => (
                <div key={c.id} className="bg-card/50 rounded-lg px-3 py-2 border border-border/50 flex justify-between items-center opacity-60 mb-1.5">
                    <div>
                        <p className="text-foreground text-sm line-through">{c.name}</p>
                        <p className="text-muted-foreground text-[11px]">{c.city}</p>
                    </div>
                    <button
                        onClick={() => onRestore(c.id)}
                        className="text-primary text-[10px] uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded border border-primary/30 bg-primary/5"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Restaurar
                    </button>
                </div>
            ))}
        </div>
    );
}
