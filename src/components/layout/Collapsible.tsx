import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CollapsibleProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export default function Collapsible({
  trigger,
  children,
  defaultOpen = false,
  onOpenChange,
  className = ""
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div className={className}>
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-3 transition-colors hover:opacity-80"
      >
        {trigger}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}
