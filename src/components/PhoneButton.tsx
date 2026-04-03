import { Phone } from "lucide-react";

interface PhoneButtonProps {
  phone: string;
  size?: "sm" | "md";
}

export default function PhoneButton({ phone, size = "sm" }: PhoneButtonProps) {
  const cleanPhone = phone.replace(/\D/g, "");
  const href = `tel:+55${cleanPhone}`;

  return (
    <a
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-lg transition-colors hover:bg-primary/20 ${
        size === "md" ? "px-4 py-2.5 text-sm" : "px-3 py-1.5 text-xs"
      }`}
    >
      <Phone className={size === "md" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      <span>Ligar</span>
    </a>
  );
}
