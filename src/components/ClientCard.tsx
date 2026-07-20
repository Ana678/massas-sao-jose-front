import { Phone, MapPin, FileText } from "lucide-react";
import { type Client } from "@/lib/types";
import { Link } from "@tanstack/react-router";

interface ClientCardProps {
    client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {

    const compact = !client.cnpj?.trim();

    return (
        <Link
            to="/clients/$id"
            params={{ id: client.id }}
            className="block w-full bg-card rounded-xl p-4 border border-border text-left transition-transform active:scale-[0.98]"
        >
            <div className="flex gap-3">
                <div className="flex flex-col min-w-0 gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-foreground text-sm font-normal truncate">{client.name}</p>
                        {client.needFiscalNote && (
                            <span className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                                NF
                            </span>
                        )}
                    </div>
                    {client.socialReason && !compact && (
                        <p className="text-muted-foreground text-xs mt-0.5 truncate">{client.socialReason}</p>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{client.city}</span>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{client.phone}</span>
                        </div>
                        {!compact && (

                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <FileText className="w-3 h-3 shrink-0" />
                                <span>{client.cnpj}</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </Link>
    );
}
