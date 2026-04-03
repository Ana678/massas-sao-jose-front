import { Minus, Plus } from "lucide-react";

interface QtyAdjusterProps {
  label: string;
  icon?: string;
  qty: number;
  onAdjust: (delta: number) => void;
  dimmed?: boolean;
}

export default function QtyAdjuster({ label, icon, qty, onAdjust, dimmed = false }: QtyAdjusterProps) {
  return (
    <div className={`flex items-center justify-between ${dimmed ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-foreground text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-2 bg-background rounded-lg px-1 border border-border">
        <button
          onClick={() => onAdjust(-1)}
          className="w-6 h-6 flex items-center justify-center text-accent hover:bg-card rounded transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-foreground text-xs w-6 text-center font-medium">{qty}</span>
        <button
          onClick={() => onAdjust(1)}
          className="w-6 h-6 flex items-center justify-center text-primary hover:bg-card rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
