const statusConfig: Record<string, { label: string; className: string }> = {
  concluido: { label: "Concluído", className: "bg-primary/10 text-primary" },
  preparando: { label: "Preparando", className: "bg-accent/10 text-accent" },
  saiu_entrega: { label: "Em entrega", className: "bg-accent/10 text-accent" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
  pendente_sync: { label: "Pendente", className: "bg-muted text-muted-foreground" },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
