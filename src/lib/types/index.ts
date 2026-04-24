export interface Product {
    id: string;
    name: string;
    investment: number;
    price: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    cnpj?: string;
    cep?: string;
    address: string;
    city: string;
    state: string;
    needFiscalNote?: boolean;
    socialReason?: string;
    stateInscription?: string;

    averageOrder?: Record<string, number>;

}

export interface OrderItem {

    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface Order {
    id: string;
    //clientId: string;
    clientName: string;
    products: OrderItem[];
    total: number;
    paymentMethod: string;
    //status: 'preparando' | 'saiu_entrega' | 'concluido' | 'cancelado' | 'pendente_sync';
    createdAt: string;
    //isPreOrder: boolean;
    isPaid: boolean;
}

export interface Expense {
    id: string;
    description: string;
    value: number;
    category: string;
    createdAt: string;
}

export interface RouteOverride {
    id: string;
    date: string; // YYYY-MM-DD
    cities: string[];
    reason: string;
}
