import EditOrderPage from '@/pages/EditOrderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/order/edit')({
    component: EditOrderComponent,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            id: (search.id as string),
        }
    }
})

function EditOrderComponent() {
    return <EditOrderPage />
}
