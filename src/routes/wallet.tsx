import WalletPage from '@/pages/WalletPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wallet')({
    component: WalletComponent,
})

function WalletComponent() {
    return <WalletPage />
}
