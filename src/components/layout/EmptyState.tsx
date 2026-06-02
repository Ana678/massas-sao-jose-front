import { Cloud } from "lucide-react";

interface EmptyStateProps {
	icon?: React.ComponentType<{ className?: string }>;
	message: string;
	action?: React.ReactNode;
	className?: string;
}

export default function EmptyState({
	message,
	action,
	className = "h-[50vh]"
}: EmptyStateProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center p-6 text-muted-foreground ${className}`}
		>
			<Cloud className="w-8 h-8 mb-4 text-foreground" />
			<p className="text-center">{message}</p>
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}
