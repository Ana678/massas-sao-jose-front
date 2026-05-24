interface SegmentedControlTab {
    key: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    count?: number;
}

interface SegmentedControlProps {
    tabs: SegmentedControlTab[];
    activeKey: string;
    onChange: (key: string) => void;
}

export default function SegmentedControl({ tabs, activeKey, onChange }: SegmentedControlProps) {
    return (
        <div className="flex gap-2">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeKey === tab.key;
                return (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border transition-colors ${
                            isActive
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-foreground border-border"
                        }`}
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span className={`text-[10px] ${isActive ? "opacity-80" : "text-muted-foreground"}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
