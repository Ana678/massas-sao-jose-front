import { MapPin } from "lucide-react";
import type { Client } from "@/lib/types";

interface AddressLinkProps {
    client: Client;
    className?: string;
}

export default function AddressLink({ client, className = "" }: AddressLinkProps) {
    const fullAddress = `${client.address}, ${client.city} - ${client.state}, ${client.cep}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    return (
        <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-start gap-1.5 text-muted-foreground text-xs hover:text-primary transition-colors ${className}`}
            onClick={(e) => e.stopPropagation()}
        >
            <MapPin className="w-2.5 h-2.5 shrink-0 mt-0.5" />
            <span className="font-medium leading-tight truncate max-w-[60%]">{client.city} - {client.state} | {client.address}</span>
        </a>
    );
}
