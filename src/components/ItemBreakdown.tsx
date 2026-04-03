import type { Product } from "@/lib/data";

interface ItemBreakdownProps {
  quantities: Record<string, number>;
  products: Product[];
}

export default function ItemBreakdown({ quantities, products }: ItemBreakdownProps) {
  const entries = Object.entries(quantities).filter(([, q]) => q > 0);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([pid, qty]) => {
        const p = products.find((x) => x.id === pid);
        if (!p) return null;
        return (
          <span
            key={pid}
            className="text-[11px] bg-background border border-border px-1.5 py-0.5 rounded text-foreground"
          >
            {p.icon} {qty} {p.name}
          </span>
        );
      })}
    </div>
  );
}
