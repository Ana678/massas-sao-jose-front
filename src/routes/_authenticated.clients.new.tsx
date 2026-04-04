import NewClientPage from '@/pages/NewClientPage';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/clients/new')({
    component: NewClientPage,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            dia: (search.dia as string) || undefined,
        }
    },
});
