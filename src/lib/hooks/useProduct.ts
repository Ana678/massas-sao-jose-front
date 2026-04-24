import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { Product } from '@/lib/types';

export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await api.get<Product[]>('/products');
            return response.data;
        },
    });
}

export function useSaveProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (product: Partial<Product>) => {
            if (product.id) {
                const response = await api.put(`/products/${product.id}`, {
                    name: product.name,
                    investment: product.investment,
                    price: product.price
                });
                return response.data;
            } else {
                const response = await api.post('/products', {
                    name: product.name,
                    investment: product.investment,
                    price: product.price
                });
                return response.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
}
