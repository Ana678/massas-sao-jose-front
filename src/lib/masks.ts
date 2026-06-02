export function maskPhone(value: string): string {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
        return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCEP(value: string): string {
    const d = value.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function maskCNPJ(value: string): string {
    const d = value.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12)
        return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(
        8,
        12
    )}-${d.slice(12)}`;
}

export function maskIE(value: string): string {
    return value.replace(/[^\d.\-/]/g, "").slice(0, 20);
}

export function maskUF(value: string): string {
    return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
}

export function maskCurrency(value: string): string {
    const d = value.replace(/\D/g, "");
    if (!d) return "";
    const num = parseInt(d, 10);
    return num.toLocaleString("pt-BR");
}

export function parseCurrency(value: string): number {
    const d = value.replace(/\D/g, "");
    return d ? parseInt(d, 10) : 0;
}
