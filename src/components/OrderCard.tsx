import { Link } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/utils";
import { type Order } from "@/lib/types";
import { LocateFixed, MapPin } from "lucide-react";


interface OrderCardProps {
    order: Order;
    city?: string;
}

export default function OrderCard({ order, city }: OrderCardProps) {
    const originalPrice = order.products.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return (
        <Link
            to="/order/edit"
            search={{ id: order.id }}
        >
            <div className={`mt-3 bg-card rounded-xl p-4 border transition-colors ${order.status === 'CANCELADO' ? 'border-destructive/20 opacity-70' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-0.5 w-100">
                        <div className="flex gap-2">
                            <p className="text-foreground text-sm font-normal">
                                {order.clientName} &nbsp;
                                <div className="inline-flex items-center gap-0.5 text-foreground/60 text-xs">
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    {city}
                                </div>
                            </p>
                            {
                                order.status === 'ENTREGUE' ? (

                                    <span className={`text-[10px] h-fit border ml-auto uppercase tracking-wider px-1.5 py-0.5 rounded-full align-middle border-primary/10 bg-primary/5 text-primary "`}>
                                        {order.status}
                                    </span>
                                ) : (
                                    <button
                                        className={`text-[10px] border ml-auto uppercase tracking-wider px-1.5 py-0.5 rounded-full align-middle border-primary/10 bg-primary text-primary-foreground`}>
                                        Concluir Entrega
                                    </button>
                                )
                            }
                        </div>
                        <p className="text-foreground/70 text-xs mt-0.5">
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
                            <span>{i.quantity} x {i.name}</span>
                            {i.discount !== undefined && i.discount > 0 && (
                                <span className="text-primary bg-primary/10 border border-primary/20 px-0.5 rounded text-[10px]">
                                    -{i.discount}%
                                </span>
                            )}
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
                                {order.isPaid ?
                                    (order.paymentMethod + ' • Pago') :
                                    (order.paymentMethod + ' • Não Pago')
                                }
                            </span>
                        </div>
                        <div className="flex flex-col text-right">
                            {
                                order.products.some(p => p.discount > 0) && (
                                    <span className={`text-xs line-through font-normal text-foreground/70`}>
                                        {formatCurrency(originalPrice)}
                                    </span>
                                )
                            }
                            <span className={`text-sm font-normal ${order.isPaid ? 'text-primary' : 'text-destructive'}`}>
                                {formatCurrency(order.total)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
