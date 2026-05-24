import { Search } from "lucide-react";

interface SearchInputProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    maxLength?: number;
}

export default function SearchInput({
    placeholder = "Buscar...",
    value,
    onChange,
    maxLength = 80
}: SearchInputProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
        </div>
    );
}
