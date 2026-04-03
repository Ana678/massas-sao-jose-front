import NewOrderPage from '@/pages/NewOrderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/order/new')({
    component: NewOrderComponent,
})

function NewOrderComponent() {
    return <NewOrderPage />
}
