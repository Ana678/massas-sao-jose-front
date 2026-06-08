import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { toast } from "sonner";

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
	}[];
}

interface ConfirmDeliveryInput {
	clientId: string;
	paymentMethod?: string;
	deliveryFee?: number;
	isPaid?: boolean;
}

export interface ProductionEstimateResponse {
	targetCities: string[];
	estimate: {
		productId: string;
		productName: string;
		firmOrders: number;
		historicalAverage: number;
		suggestedProduction: number;
	}[];
}

export function useOrdersList(page = 1, limit = 100) {
	return useQuery({
		queryKey: ["orders", page, limit],
		queryFn: async () => {
			const response = await api.get<OrderResponse[]>("/orders", {
				params: { page, limit },
			});
			return response.data;
		},
	});
}

export function useOrderByID(id: string) {
	return useQuery({
		queryKey: ["orders", id],
		queryFn: async () => {
			const response = await api.get<OrderResponse>(`/orders/${id}`);
			return response.data;
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

			return response.data;
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
			return response.data;
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
