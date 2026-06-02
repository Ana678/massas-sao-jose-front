import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RouteOverride } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value?: number | string | null) {
    const num = Number(value);
    if (value === undefined || value === null || isNaN(num)) {
        return "R$ Error";
    }

    return num.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function getCitiesForToday(date: Date, overrides: RouteOverride[]): string[] {
    const dateStr = date.toISOString().slice(0, 10);

    const override = overrides.find(o => o.date === dateStr);
    if (override) return override.cities;

    const dayOfWeek = date.getDay();

    const schedule: Record<number, string[]> = {
        1: ['São João do Sabugi'],
        3: ['São Mamede'],
        4: ['Caicó', 'Timbaúba dos Batistas', 'Jardim de Piranhas'],
        5: ['Santa Luzia'],
        6: ['São Mamede']
    };

    return schedule[dayOfWeek] || [];
}

export function monthLabel(d: Date, includeYear = false) {
    const m = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return includeYear ? `${m}/${String(d.getFullYear()).slice(-2)}` : m;
}

export function tooltipCurrencyFormatter(value: number | string | ReadonlyArray<number | string> | undefined) {
    const raw = Array.isArray(value) ? value[0] : value;
    const numericValue = Number(raw ?? 0);
    return formatCurrency(Number.isFinite(numericValue) ? numericValue : 0);
}

export function monthsBetween(fromKey: string, toKey: string): { key: string; date: Date }[] {
    const [fy, fm] = fromKey.split("-").map(Number);
    const [ty, tm] = toKey.split("-").map(Number);
    const result: { key: string; date: Date }[] = [];
    let y = fy, m = fm;
    while (y < ty || (y === ty && m <= tm)) {
        const d = new Date(y, m - 1, 1);
        result.push({ key: d.toISOString().slice(0, 7), date: d });
        m++;
        if (m > 12) { m = 1; y++; }
    }
    return result;
}
