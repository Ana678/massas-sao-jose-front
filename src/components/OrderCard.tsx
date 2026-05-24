import { Link } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/utils";

interface Order {
    id: string;
    clientName: string;
    createdAt: string;
    status?: string;
    isPaid: boolean;
    paymentMethod: string;
    total: number;
    products?: Array<{
        id: string;
        quantity: number;
        name: string;
    }>;
}

interface OrderCardProps {
    order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
    return (
        <Link
            to="/order/edit"
            search={{ id: order.id }}
        >
            <div className={`mt-3 bg-card rounded-xl p-4 border transition-colors ${order.status === 'CANCELADO' ? 'border-destructive/20 opacity-70' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-foreground text-sm font-normal">{order.clientName}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            {new Date(order.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                    {order.status === 'CANCELADO' && (
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-destructive/10 text-destructive`}>
                                Cancelado
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-0.5">
                    {order.products?.map((i) => (
                        <p key={i.id} className="text-muted-foreground text-xs flex justify-between">
                            <span>{i.quantity}x {i.name}</span>
                        </p>
                    ))}
                </div>

                {order.status !== 'CANCELADO' && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full align-middle ${order.isPaid
                                ? "bg-primary/10 text-primary"
                                : "bg-destructive/10 text-destructive"
                                }`}>
                                {order.isPaid ? order.paymentMethod + ' • Pago' : order.paymentMethod + ' • Não Pago'}
                            </span>
                        </div>
                        <span className={`text-sm font-normal ${order.isPaid ? 'text-primary' : 'text-destructive'}`}>
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
}
