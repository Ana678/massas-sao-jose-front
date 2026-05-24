import { Cloud } from "lucide-react";

interface LoadingStateProps {
    message?: string;
    className?: string;
}

export default function LoadingState({
    message = "Carregando...",
    className = "py-20"
}: LoadingStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center text-muted-foreground gap-4 ${className}`}>
            <Cloud className="w-8 h-8 animate-pulse text-primary" />
            <p>{message}</p>
        </div>
    );
}
