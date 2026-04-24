import { type Expense, type Order, type RouteOverride } from "./types";


export type DayOfWeek = 'segunda' | 'quarta' | 'quinta' | 'sexta' | 'sabado';

export const DELIVERY_ROUTES: Record<DayOfWeek, string[]> = {
    segunda: ['São João do Sabugi'],
    quarta: ['São Mamede'],
    quinta: ['Caicó', 'Jardim de Piranhas', 'Timbaúba dos Batistas'],
    sexta: ['Santa Luzia'],
    sabado: ['São Mamede'],
};

export const ALL_CITIES = [
    'São João do Sabugi', 'São Mamede', 'Caicó',
    'Jardim de Piranhas', 'Timbaúba dos Batistas', 'Santa Luzia',
];

export const EXPENSE_CATEGORIES = {
    insumos: 'Insumos/Fornecedores',
    salarios: 'Salários',
    combustivel: 'Combustível/Viagens',
    manutencao: 'Manutenção',
    outros: 'Outros',
};


// Local storage helpers — version bump forces refresh of defaults
const DATA_VERSION = '4';
const STORAGE_KEYS = {
    products: 'msj_products',
    clients: 'msj_clients',
    orders: 'msj_orders',
    expenses: 'msj_expenses',
    routeOverrides: 'msj_route_overrides',
    skippedClients: 'msj_skipped_clients',
    version: 'msj_version',
};

// Skipped clients: Record<dayKey, clientId[]> where dayKey = DayOfWeek or YYYY-MM-DD
export function getSkippedClients(): Record<string, string[]> {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.skippedClients);
        return data ? JSON.parse(data) : {};
    } catch { return {}; }
}

export function saveSkippedClients(s: Record<string, string[]>) {
    localStorage.setItem(STORAGE_KEYS.skippedClients, JSON.stringify(s));
}

export function toggleSkipClient(dayKey: string, clientId: string) {
    const all = getSkippedClients();
    const list = all[dayKey] || [];
    if (list.includes(clientId)) {
        all[dayKey] = list.filter(id => id !== clientId);
    } else {
        all[dayKey] = [...list, clientId];
    }
    saveSkippedClients(all);
    return all;
}

// Clear old data on version change
if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.version) !== DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.products);
    localStorage.removeItem(STORAGE_KEYS.clients);
    localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
}

function load<T>(key: string, fallback: T[]): T[] {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch { return fallback; }
}

function save<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
}


export function getOrders(): Order[] { return load(STORAGE_KEYS.orders, []); }
export function saveOrders(o: Order[]) { save(STORAGE_KEYS.orders, o); }

export function getExpenses(): Expense[] { return load(STORAGE_KEYS.expenses, []); }
export function saveExpenses(e: Expense[]) { save(STORAGE_KEYS.expenses, e); }

export function getRouteOverrides(): RouteOverride[] { return load(STORAGE_KEYS.routeOverrides, []); }
export function saveRouteOverrides(r: RouteOverride[]) { save(STORAGE_KEYS.routeOverrides, r); }

export function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export function getTodayRoute(): string[] {
    // Check for override first
    const todayStr = new Date().toISOString().slice(0, 10);
    const overrides = getRouteOverrides();
    const override = overrides.find((o) => o.date === todayStr);
    if (override) return override.cities;

    const days: DayOfWeek[] = ['segunda', 'segunda', 'quarta', 'quinta', 'sexta', 'sabado', 'segunda'];
    const jsDay = new Date().getDay(); // 0=Sun
    const mapped: DayOfWeek = days[jsDay === 0 ? 6 : jsDay - 1] || 'segunda';
    // For demo, if today has no route, show Thursday (most cities)
    return DELIVERY_ROUTES[mapped] || DELIVERY_ROUTES.quinta;
}

export function getTodayDayName(): string {
    const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return names[new Date().getDay()];
}


