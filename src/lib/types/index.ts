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
    clientId: string;
    createdAt: string;
    clientName: string;
    enabled: boolean;
    disabledUntil: string | null;
    total: number;
    isPaid: boolean;
    paymentMethod: string;
    status: string;
    products: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
        discount: number;
    }[];
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
    date: string;
    cities: string[];
    reason: string;
}
