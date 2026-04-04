import FinanceDashboardPage from '@/pages/FinanceDashboardPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/finance')({
    component: FinanceDashboardComponent,
})

function FinanceDashboardComponent() {
    return <FinanceDashboardPage />
}
