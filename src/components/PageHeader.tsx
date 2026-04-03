import { ArrowLeft } from "lucide-react";

interface Props {
    title: string;
    subtitle?: string;
    backTo?: string;
    rightAction?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, backTo, rightAction }: Props) {

    return (
        <header className="flex justify-between items-start px-6 pt-8 pb-4">
            <div className="flex items-center gap-3">
                {backTo && (
                    <button onClick={() => console.log('backTo')} className="text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <div>
                    <h1 className="font-display text-xl tracking-tight leading-tight">{title}</h1>
                    {subtitle && <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {rightAction}
        </header>
    );
}
