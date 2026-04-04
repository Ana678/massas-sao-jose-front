// Types
export interface Product {
    id: string;
    name: string;
    costPrice: number;
    sellPrice: number;
    unit: string;
    icon: string;
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    email?: string;
    cpfCnpj: string;
    razaoSocial?: string;
    inscricaoEstadual?: string;
    cep: string;
    endereco: string;
    cidade: string;
    estado: string;
    needsInvoice?: boolean;
    averageOrder?: Record<string, number>; // productId -> qty
}

export interface OrderItem {
    productId: string;
    productName: string;
    qty: number;
    unitPrice: number;
}

export interface Order {
    id: string;
    clientId: string;
    clientName: string;
    items: OrderItem[];
    total: number;
    paymentMethod: 'pix' | 'cartao' | 'dinheiro';
    status: 'preparando' | 'saiu_entrega' | 'concluido' | 'cancelado' | 'pendente_sync';
    createdAt: string;
    isPreOrder: boolean;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: 'insumos' | 'salarios' | 'combustivel' | 'manutencao' | 'outros';
    date: string;
}

export interface RouteOverride {
    id: string;
    date: string; // YYYY-MM-DD
    cities: string[];
    reason: string;
}

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

// Default products
export const DEFAULT_PRODUCTS: Product[] = [
    { id: '1', name: 'Bolacha Preta', costPrice: 3, sellPrice: 8, unit: 'un', icon: '🍫' },
    { id: '2', name: 'Bolacha de Leite', costPrice: 3, sellPrice: 8, unit: 'un', icon: '🍪' },
    { id: '3', name: 'Biscoito Palito', costPrice: 3, sellPrice: 8, unit: 'un', icon: '🥖' },
    { id: '4', name: 'Doce de Leite', costPrice: 4, sellPrice: 10, unit: 'un', icon: '🍮' },
    { id: '5', name: 'Doce Leite c/ Goiaba', costPrice: 4, sellPrice: 10, unit: 'un', icon: '🍬' },
    { id: '6', name: 'Doce de Espécie', costPrice: 4, sellPrice: 10, unit: 'un', icon: '🧁' },
    { id: '7', name: 'Rapadura de Leite', costPrice: 4, sellPrice: 10, unit: 'un', icon: '🧱' },
    { id: '8', name: 'Rapadura de Coco', costPrice: 4, sellPrice: 10, unit: 'un', icon: '🥥' },
    { id: '9', name: 'Rapadura Leite c/ Coco', costPrice: 4, sellPrice: 10, unit: 'un', icon: '🫧' },
];

// Default clients
export const DEFAULT_CLIENTS: Client[] = [
    {
        id: '1', name: 'Padaria Estrela', phone: '(84) 99999-0001', cpfCnpj: '12.345.678/0001-90',
        razaoSocial: 'Padaria Estrela LTDA', cep: '59300-000', endereco: 'Rua Principal, 100',
        cidade: 'Caicó', estado: 'RN', email: 'estrela@email.com', needsInvoice: true,
        averageOrder: { '1': 10, '2': 5 },
    },
    {
        id: '2', name: 'Dona Maria (Rotisserie)', phone: '(84) 99999-0002', cpfCnpj: '987.654.321-00',
        cep: '59300-000', endereco: 'Av. Coronel, 50', cidade: 'Caicó', estado: 'RN',
        needsInvoice: false,
        averageOrder: { '4': 5, '7': 3 },
    },
    {
        id: '3', name: 'Mercado Central', phone: '(84) 99999-0003', cpfCnpj: '11.222.333/0001-44',
        razaoSocial: 'Mercado Central LTDA', inscricaoEstadual: '20.123.456-7',
        cep: '59300-000', endereco: 'Praça da Liberdade, 1', cidade: 'Caicó', estado: 'RN',
        needsInvoice: true,
        averageOrder: { '1': 10, '2': 5, '4': 5 },
    },
    {
        id: '4', name: 'Padaria São José', phone: '(83) 99999-0004', cpfCnpj: '44.555.666/0001-77',
        razaoSocial: 'Padaria São José ME', cep: '58748-000', endereco: 'Rua do Comércio, 22',
        cidade: 'São Mamede', estado: 'PB', needsInvoice: true,
        averageOrder: { '2': 5, '1': 10, '4': 5 },
    },
];

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

export function getProducts(): Product[] { return load(STORAGE_KEYS.products, DEFAULT_PRODUCTS); }
export function saveProducts(p: Product[]) { save(STORAGE_KEYS.products, p); }

export function getClients(): Client[] { return load(STORAGE_KEYS.clients, DEFAULT_CLIENTS); }
export function saveClients(c: Client[]) { save(STORAGE_KEYS.clients, c); }

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

export function formatCurrency(v: number) {
    return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function clientNeedsInvoice(client: Client): boolean {
    return client.needsInvoice || !!(client.razaoSocial && client.cpfCnpj?.includes("/"));
}
