import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Client, Order } from '@/lib/types';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';


export function useClients() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const response = await api.get<Client[]>('/clients');
            return response.data;
        },
    });
}

export function useClient(id: string) {
    return useQuery({
        queryKey: ['client', id],
        queryFn: async () => {
            const response = await api.get<Client>(`/clients/${id}`);

            if (!response.data) {
                throw new Error("Cliente não encontrado");
            }
            return response.data;
        },
        enabled: !!id, // implies that the query will only run if id is truthy
    });
}


export function useClientOrders(clientId: string) {

    return useQuery({
        queryKey: ['client', clientId, 'orders'],
        queryFn: async () => {
            const response = await api.get<Order[]>(`/clients/${clientId}/orders`);
            return response.data;
        },
        enabled: !!clientId,
    });

}

export function useSaveClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (client: Partial<Client>) => {
            if (client.id) {
                return api.put(`/clients/${client.id}`, client);
            } else {
                return api.post('/clients', client);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['client'] });
        }
    });
}

export function useDeleteClient() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/clients/${id}`);
        },
        onSuccess: () => {
            toast.success("Cliente excluído com sucesso");
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            navigate({ to: '/clients' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Erro ao excluir cliente";
            toast.error(message);
        }
    });
}


export function useClientsCities(cities: string[] = []) {
    return useQuery({
        queryKey: ['cities', cities],
        queryFn: async () => {
            const response = await api.get<Client[]>(`/clients/by-cities/${cities.map(encodeURIComponent).join(',')}`);
            return response.data;
        },
    });
}
