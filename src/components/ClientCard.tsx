import { Phone, MapPin } from "lucide-react";
import { clientNeedsInvoice, type Client } from "@/lib/data";

interface ClientCardProps {
    client: Client;
    onClick?: () => void;
    showPhone?: boolean;
    showAddress?: boolean;
    showNFBadge?: boolean;
    compact?: boolean;
}

export default function ClientCard({ client, onClick, showPhone = true, showAddress = true, showNFBadge = true, compact = false }: ClientCardProps) {
    const hasNF = clientNeedsInvoice(client);

    const content = (
        <>
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="text-foreground text-sm font-normal truncate">{client.name}</p>
                        {showNFBadge && hasNF && (
                            <span className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                                NF
                            </span>
                        )}
                    </div>
                    {client.razaoSocial && !compact && (
                        <p className="text-muted-foreground text-xs mt-0.5 truncate">{client.razaoSocial}</p>
                    )}
                </div>
                {/* {!compact && <span className="text-muted-foreground text-xs shrink-0">{client.cpfCnpj}</span>} */}
            </div>
            <div className="flex items-center gap-4 mt-2">
                {showAddress && (
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{client.cidade}</span>
                    </div>
                )}
                {showPhone && (
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span>{client.phone}</span>
                    </div>
                )}
            </div>
        </>
    );

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className="w-full bg-card rounded-xl p-4 border border-border text-left transition-transform active:scale-[0.98]"
            >
                {content}
            </button>
        );
    }

    return (
        <div className="bg-card rounded-xl p-4 border border-border">
            {content}
        </div>
    );
}
