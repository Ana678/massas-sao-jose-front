import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface StatusSelectorProps {
	value: string;
	onChange: (status: string) => void;
}

const statuses = [
	{ key: "PENDENTE", label: "Pendente", icon: Clock },
	{ key: "ENTREGUE", label: "Entregue", icon: CheckCircle2 },
	{ key: "CANCELADO", label: "Cancelado", icon: XCircle },
];

export default function StatusSelector({
	value = "PENDENTE",
	onChange,
}: StatusSelectorProps) {
	return (
		<div className="flex gap-2">
			{statuses.map((s) => {
				const Icon = s.icon;
				return (
					<button
						key={s.key}
						onClick={() => onChange(s.key)}
						className={`flex-1 py-2.5 rounded-xl text-xs font-normal border transition-colors ${
							value === s.key
								? "bg-primary text-primary-foreground border-primary"
								: "bg-card text-foreground border-border"
						}`}
					>
						<span className="inline-flex items-center gap-1.5">
							<Icon className="w-3.5 h-3.5" />
							{s.label}
						</span>
					</button>
				);
			})}
		</div>
	);
}
