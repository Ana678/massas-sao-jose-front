import { CheckCircle } from "lucide-react";
import { type Client, type Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ClientDoneCardProps {
	client: Client;
	order: Order | undefined;
}

export function ClientDoneCard({ client, order }: ClientDoneCardProps) {
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
							Pedido Entregue •{" "}
							{order ? formatCurrency(order.total) : "R$ 0,00"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
