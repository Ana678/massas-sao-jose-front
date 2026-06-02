import type { DayOfWeek } from "@/lib/data";

interface DaySelectorProps {
  value: DayOfWeek;
  onChange: (day: DayOfWeek) => void;
  formattedDate?: string;
}

const days: { key: DayOfWeek; label: string }[] = [
  { key: "segunda", label: "Seg" },
  { key: "quarta", label: "Qua" },
  { key: "quinta", label: "Qui" },
  { key: "sexta", label: "Sex" },
  { key: "sabado", label: "Sáb" },
];

export default function DaySelector({ value, onChange, formattedDate }: DaySelectorProps) {
  return (
    <div className="flex gap-2">
      {days.map((d) => (
        value === d.key ? (
        <button
          key={d.key}
          onClick={() => onChange(d.key)}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors border bg-primary text-primary-foreground border-primary`}
        >
          {d.label}
          {formattedDate && (
            <span className="block text-[10px] font-normal text-primary-foreground/75">
              {formattedDate}
            </span>
          )}
        </button>
        ) : (
          <button
            key={d.key}
            onClick={() => onChange(d.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-normal transition-colors border bg-card text-foreground border-border`}
            >
          {d.label}
          </button>
        )
      ))}
    </div>
  );
}
