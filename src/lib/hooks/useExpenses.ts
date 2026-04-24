import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { toast } from 'sonner';


export interface ExpensesResponse {

    id: string;
    description: string;
    value: number;
    category: string;
    createdAt: string;

}

export function useExpensesList() {

    return useQuery({

        queryKey: ['expenses'],
        queryFn: async () => {
            const response = await api.get<ExpensesResponse[]>('/expenses');
            return response.data;
        }
    });
}


export function useCreateExpense() {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { description: string; value: number; category: string }) => {
            const response = await api.post<ExpensesResponse>('/expenses', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Despesa criada com sucesso!');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Erro ao criar despesa";
            toast.error(message);
        }

    });
}


export function useDeleteExpense() {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete<ExpensesResponse>(`/expenses/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success('Despesa excluída com sucesso!');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Erro ao excluir despesa";
            toast.error(message);
        }
    });
}
