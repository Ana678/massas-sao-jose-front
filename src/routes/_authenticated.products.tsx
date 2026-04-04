import ProductsPage from '@/pages/ProductsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/products')({
    component: ProductsComponent,
})

function ProductsComponent() {
    return <ProductsPage />
}
