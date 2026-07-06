import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export interface FinanceMetricsResponse {
    periodTotals: {
        revenue: number;
        costs: number;
        profit: number;
        ordersCount: number;
        expensesCount: number;
    };
    monthsData: {
        name: string;
        key: string;
        receita: number;
        despesa: number;
        lucro: number;
    }[];
    categoryData: {
        key: string;
        value: number;
    }[];
}

export function useFinanceMetrics(startDate: string, endDate: string) {
    return useQuery({
        queryKey: ['finance-metrics', startDate, endDate],
        queryFn: async () => {
            const response = await api.get<FinanceMetricsResponse>('/finance/metrics', {
                params: { startDate, endDate }
            });
            return response.data;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 1000 * 60 * 5,
    });
}
