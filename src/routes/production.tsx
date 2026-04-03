import ProductionPage from '@/pages/ProductionPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/production')({
    component: ProductionComponent,
})

function ProductionComponent() {
    return <ProductionPage />
}
