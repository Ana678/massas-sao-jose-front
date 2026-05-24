import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { generateId, getRouteOverrides, saveRouteOverrides, ALL_CITIES } from "@/lib/data";

interface RouteOverrideModalProps {
    onClose: () => void;
}

export function RouteOverrideModal({ onClose }: RouteOverrideModalProps) {
    const [overrideDate, setOverrideDate] = useState("");
    const [overrideCities, setOverrideCities] = useState<string[]>([]);
    const [overrideReason, setOverrideReason] = useState("");

    const overrides = getRouteOverrides();

    function saveOverride() {
        if (!overrideDate || overrideCities.length === 0) {
            toast.error("Preencha a data e selecione ao menos uma cidade");
            return;
        }
        const existing = overrides.filter((o) => o.date !== overrideDate);
        const newOverride = { id: generateId(), date: overrideDate, cities: overrideCities, reason: overrideReason };
        saveRouteOverrides([...existing, newOverride]);
        toast.success("Rota alterada para " + new Date(overrideDate + "T12:00").toLocaleDateString("pt-BR"));
        onClose();
    }

    function toggleCity(city: string) {
        setOverrideCities((prev) =>
            prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
        );
    }

    function removeOverride(id: string) {
        saveRouteOverrides(overrides.filter((x) => x.id !== id));
        toast.success("Alteração removida");
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
            <div className="w-full max-w-md bg-background rounded-t-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-display text-lg">Alterar Rota (Feriado)</h3>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-4">
                    <div>
                        <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">Data</label>
                        <input
                            type="date"
                            value={overrideDate}
                            onChange={(e) => setOverrideDate(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                    <div>
                        <label className="text-muted-foreground text-xs uppercase tracking-widest mb-2 block">Cidades para este dia</label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_CITIES.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => toggleCity(city)}
                                    className={`px-3 py-2 rounded-xl text-xs border transition-colors ${overrideCities.includes(city) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-muted-foreground text-xs uppercase tracking-widest mb-1 block">Motivo (opcional)</label>
                        <input
                            type="text"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="Ex: Feriado municipal"
                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {overrides.length > 0 && (
                        <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Alterações agendadas</p>
                            {overrides.map((o) => (
                                <div key={o.id} className="bg-card rounded-xl p-3 border border-border mb-2 flex justify-between items-center">
                                    <div>
                                        <p className="text-foreground text-sm">{new Date(o.date + "T12:00").toLocaleDateString("pt-BR")}</p>
                                        <p className="text-muted-foreground text-xs">{o.cities.join(", ")}</p>
                                        {o.reason && <p className="text-accent text-xs mt-0.5">{o.reason}</p>}
                                    </div>
                                    <button onClick={() => removeOverride(o.id)} className="text-destructive p-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-border">
                    <button
                        onClick={saveOverride}
                        disabled={!overrideDate || overrideCities.length === 0}
                        className="w-full bg-primary text-primary-foreground rounded-xl p-3.5 font-normal disabled:opacity-50 transition-transform active:scale-[0.98]"
                    >
                        Salvar Alteração
                    </button>
                </div>
            </div>
        </div>
    );
}
