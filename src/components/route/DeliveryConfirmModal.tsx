import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import PaymentSelector from "@/components/PaymentSelector";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { type Client } from "@/lib/types";

interface DeliveryConfirmModalProps {
    client: Client;
    quantities: Record<string, number>;
    onClose: () => void;
}

export function DeliveryConfirmModal({ client, quantities, onClose }: DeliveryConfirmModalProps) {
    const [deliveryPaid, setDeliveryPaid] = useState(true);
    const [deliveryPayment, setDeliveryPayment] = useState<"pix" | "cartao" | "dinheiro" | "boleto">("dinheiro");

    const { mutate: createOrder, isPending } = useCreateOrder();

    function handleConfirm() {
        const items = Object.entries(quantities || {})
            .filter(([, q]) => q > 0)
            .map(([pid, q]) => ({ productId: pid, quantity: q }));

        if (items.length === 0) {
            toast.error("Adicione itens para concluir a entrega");
            return;
        }

        createOrder({
            clientId: client.id,
            products: items,
            paymentMethod: deliveryPayment,
            isPaid: deliveryPaid,
            status: "ENTREGUE"
        }, {
            onSuccess: () => {
                toast.success("Entrega salva no sistema!");
                onClose();
            }
        });
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="w-full max-w-md bg-background rounded-t-2xl py-4 space-y-4">
                <div className="flex items-start justify-between gap-3 px-4">
                    <div>
                        <h3 className="font-display text-xl leading-tight mt-1">{client.name}</h3>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest pt-1">Finalizar entrega</p>
                    </div>
                    <button onClick={onClose} aria-label="Fechar">
                        <X className="w-5 h-5 text-muted-foreground cursor-pointer" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 px-4">
                    <button
                        onClick={() => setDeliveryPaid(true)}
                        className={`rounded-xl border py-3 text-xs transition-colors font-normal ${deliveryPaid ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
                    >
                        Já pagou
                    </button>
                    <button
                        onClick={() => setDeliveryPaid(false)}
                        className={`rounded-xl border py-3 text-xs transition-colors font-normal ${!deliveryPaid ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
                    >
                        Ficou pendente
                    </button>
                </div>

                {deliveryPaid && (
                    <section className="flex flex-col gap-2 px-4">
                        <label className="text-muted-foreground text-xs uppercase tracking-widest mt-2">Forma de Pagamento</label>
                        <PaymentSelector value={deliveryPayment as any} onChange={setDeliveryPayment as any} />
                    </section>
                )}

                <div className="p-4 pb-0 border-t border-border">
                    <button
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="w-full bg-primary text-primary-foreground rounded-xl p-3.5 font-normal disabled:opacity-50 transition-transform active:scale-[0.98]"
                    >
                        {isPending ? "Salvando..." : "Confirmar entrega"}
                    </button>
                </div>
            </div>
        </div>
    );
}
