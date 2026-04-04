import NewOrderPage from '@/pages/NewOrderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/order/new')({
    component: NewOrderComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            dia: (search.dia as string) || undefined,
        }
    },
})

function NewOrderComponent() {
    return <NewOrderPage />
}
