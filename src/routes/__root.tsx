
import AppShell from '@/components/AppShell'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (
    <AppShell>
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    </AppShell>
)

export const Route = createRootRoute({ component: RootLayout })
