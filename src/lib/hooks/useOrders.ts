import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { toast } from "sonner";
import type { DiscountType } from "../discount";

interface CreateOrderInput {
	clientId: string;
	paymentMethod: string;
	isPaid: boolean;
	status: string;
	targetDate?: string;
	products: {
		productId: string;
		quantity: number;
        discount?: number;
        discountType?: DiscountType;
	}[];
}

interface UpdateOrderInput {
	id: string;
	paymentMethod: string;
	isPaid: boolean;
	status: string;
	targetDate?: string;
	products: {
		productId: string;
		quantity: number;
        discount?: number;
        discountType?: DiscountType;
	}[];
}

export interface OrderResponse {
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
	targetDate?: string;
	products: {
		id: string;
		name: string;
		price: number;
		quantity: number;
		subtotal: number;
        discount: number;
        discountType?: DiscountType;
	}[];
}

export interface PaginatedOrdersResponse {
    data: OrderResponse[];
    total: number;
    page: number;
    limit: number;
}

export interface OrdersFilters {
    search?: string;
    startDate?: string;
    endDate?: string;
    city?: string;
    paymentMethod?: string;
    paymentFilter?: string;
}

interface ConfirmDeliveryInput {
	clientId: string;
	paymentMethod?: string;
	deliveryFee?: number;
	isPaid?: boolean;
    products?: {
		productId: string;
		quantity: number;
		discount?: number;
		discountType?: DiscountType;
	}[];
}

export interface ProductionEstimateResponse {
	targetCities: string[];
	estimate: {
		productId: string;
		productName: string;
		firmOrders: number;
		lastOrderVolume: number;
		suggestedProduction: number;
	}[];
}

export interface DashboardSummaryResponse {
    monthRevenue: number;
    monthOrdersCount: number;
    todayRevenue: number;
    todayOrdersCount: number;
    pendingPaymentTotal: number;
    pendingOrdersCount: number;
}

export function useDashboardSummary(monthStart: string, monthEnd: string, today: string) {
    return useQuery({
        queryKey: ["dashboard-summary", monthStart, monthEnd, today],
        queryFn: async () => {
            const response = await api.get<DashboardSummaryResponse>("/orders/dashboard/summary", {
                params: { monthStart, monthEnd, today }
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 2,
    });
}

export function useExportOrders() {
    return useMutation({
        mutationFn: async (params: { startDate: string; endDate: string; status: string }) => {
            const response = await api.get("/orders/export", { params });
            return response.data;
        },
    });
}

export function useOrdersList(page = 1, limit = 50, filters: OrdersFilters = {}) {
	return useQuery({
		queryKey: ["orders", page, limit, filters],
		queryFn: async () => {

            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "" && value !== "todos" && value !== "todas")
            );

			const response = await api.get<PaginatedOrdersResponse>("/orders", {
				params: { page, limit, ...cleanFilters },
			});

            const ordersResult = response.data.data.map((order) => ({ ...order, total: Number(order.total) }));
			return {
                data: ordersResult,
                total: response.data.total,
                page: response.data.page,
                limit: response.data.limit
            };
		},
        // define um tempo em que os dados sao guardados em cache
        staleTime: 1000 * 60 * 2,

        // define um tempo em que os dados sao guardados em cache apos a ultima vez que foram acessados
        gcTime: 1000 * 60 * 10,
	});
}

export function useOrderByID(id: string) {
	return useQuery({
		queryKey: ["orders", id],
		queryFn: async () => {
			const response = await api.get<OrderResponse>(`/orders/${id}`);
            const total = Number(response.data.total);
			return { ...response.data, total };
		},
	});
}

export function useOrdersListByCity(cityNames: string[], targetDate?: string) {
	return useQuery({
		queryKey: ["orders", cityNames, targetDate],
		queryFn: async () => {
			const response = await api.post<OrderResponse[]>("/orders/by-cities", {
				cityNames,
				targetDate,
			});

            const ordersResult = response.data.map((order) => ({ ...order, total: Number(order.total) }));
			return ordersResult;
		},
		enabled: cityNames.length > 0,
	});
}

export function useOrdersByClient(clientId: string, targetDate?: string) {
	return useQuery({
		queryKey: ["orders", clientId, targetDate],
		queryFn: async () => {
			const response = await api.get<OrderResponse[]>(`/orders/by-client/${clientId}`, {
				params: { targetDate },
			});
            const ordersResult = response.data.map((order) => ({ ...order, total: Number(order.total) }));
			return ordersResult;
		},
		enabled: !!clientId,
	});
}

export function useCreateOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateOrderInput) => {
			const response = await api.post("/orders", data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Erro ao criar pedido";
			toast.error(message);
		},
	});
}

export function useUpdateOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateOrderInput) => {
			const { id, ...payload } = data;
			const response = await api.put(`/orders/${id}`, payload);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
		onError: (error: any) => {
			const message =
				error.response?.data?.message || "Erro ao atualizar pedido";
			toast.error(message);
		},
	});
}

export function useProductionEstimate(
	targetDate: string,
	overrideCities?: string[],
) {
	return useQuery({
		queryKey: ["production-estimate", targetDate, overrideCities],
		queryFn: async () => {
			const response = await api.post<ProductionEstimateResponse>(
				"/orders/production-estimate",
				{
					targetDate,
					overrideCities,
				},
			);
			return response.data;
		},
		enabled: !!targetDate,
	});
}

export function useConfirmDelivery() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ConfirmDeliveryInput) => {
			const response = await api.post("/orders/confirm-delivery", data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
		onError: (error: any) => {
			const message =
				error.response?.data?.message || "Erro ao conciliar entrega";
			toast.error(message);
		},
	});
}

export function useDeleteOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await api.delete(`/orders/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
		},
		onError: (error: any) => {
			const message = error.response?.data?.message || "Erro ao deletar pedido";
			toast.error(message);
		},
	});
}
