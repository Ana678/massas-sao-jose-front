import { toDateStr } from "@/lib/date";

export type Period = "todas" | "semana" | "mes" | "personalizado";

interface FilterableExpense {
    value: number | string;
    category: string;
    createdAt: string;
}

/** Hoje menos `days` dias, como YYYY-MM-DD local. */
export function daysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return toDateStr(d);
}

/** Semana passada fechada: segunda a domingo da semana anterior. */
export function lastWeekRange(): [string, string] {
    const today = new Date();
    const daysSinceMonday = (today.getDay() + 6) % 7; // getDay: 0 = domingo
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday - 7);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return [toDateStr(monday), toDateStr(sunday)];
}

/** Mês passado fechado: do dia 1 ao último dia do mês anterior. */
export function lastMonthRange(): [string, string] {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const last = new Date(today.getFullYear(), today.getMonth(), 0); // dia 0 = último do mês anterior
    return [toDateStr(first), toDateStr(last)];
}

/** Intervalo [de, até] em YYYY-MM-DD; string vazia = sem limite. */
export function periodRange(period: Period, customFrom: string, customTo: string): [string, string] {
    switch (period) {
        case "semana": return lastWeekRange();
        case "mes": return lastMonthRange();
        case "personalizado": return [customFrom, customTo];
        default: return ["", ""];
    }
}

/**
 * Despesas da categoria e do intervalo [de, até] (YYYY-MM-DD locais, inclusive),
 * mais recentes primeiro. `createdAt` vem da API em UTC; a comparação é feita
 * em instantes, então uma despesa às 22h do dia 30 fica no dia 30.
 */
export function filterExpenses<T extends FilterableExpense>(
    expenses: T[],
    category: string,
    dateFrom: string,
    dateTo: string,
): T[] {
    const from = dateFrom ? new Date(dateFrom + "T00:00:00").getTime() : -Infinity;
    const to = dateTo ? new Date(dateTo + "T23:59:59.999").getTime() : Infinity;
    return expenses
        .filter((e) => {
            if (category !== "todas" && e.category !== category) return false;
            const t = new Date(e.createdAt).getTime();
            return t >= from && t <= to;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Soma em centavos para não acumular erro de ponto flutuante (0,1 + 0,2). */
export function sumExpenses(expenses: Pick<FilterableExpense, "value">[]): number {
    const cents = expenses.reduce((s, e) => s + Math.round(Number(e.value) * 100), 0);
    return cents / 100;
}
