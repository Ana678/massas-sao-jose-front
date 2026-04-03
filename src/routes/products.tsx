import ProductsPage from '@/pages/ProductsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
    component: ProductsComponent,
})

function ProductsComponent() {
    return <ProductsPage />
}
