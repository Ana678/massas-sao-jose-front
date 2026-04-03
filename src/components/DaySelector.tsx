import type { DayOfWeek } from "@/lib/data";

interface DaySelectorProps {
  value: DayOfWeek;
  onChange: (day: DayOfWeek) => void;
}

const days: { key: DayOfWeek; label: string }[] = [
  { key: "segunda", label: "Seg" },
  { key: "quarta", label: "Qua" },
  { key: "quinta", label: "Qui" },
  { key: "sexta", label: "Sex" },
  { key: "sabado", label: "Sáb" },
];

export default function DaySelector({ value, onChange }: DaySelectorProps) {
  return (
    <div className="flex gap-2">
      {days.map((d) => (
        <button
          key={d.key}
          onClick={() => onChange(d.key)}
          className={`flex-1 py-2 rounded-xl text-xs font-normal transition-colors border ${
            value === d.key
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border"
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
