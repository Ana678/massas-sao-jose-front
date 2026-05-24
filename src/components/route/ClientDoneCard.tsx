import { CheckCircle, Download } from "lucide-react";
import { type Client } from "@/lib/types";

export function ClientDoneCard({ client }: { client: Client }) {
    return (
        <div className="bg-primary/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                    <div>
                        <p className="text-foreground text-sm line-through decoration-muted-foreground decoration-1 font-normal">
                            {client.name}
                        </p>
                        <p className="text-primary text-xs mt-0.5 align-middle flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-primary/80" />
                            Pedido Entregue •
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="text-primary bg-primary/10 hover:bg-primary/20 p-1.5 rounded-xl transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
