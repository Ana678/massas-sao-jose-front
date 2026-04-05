import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import AppShell from '@/components/AppShell'

export const Route = createFileRoute('/_authenticated')({

    beforeLoad: ({ context, location }) => {
        if (!context?.auth?.isAuthenticated) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.pathname,
                },

            })
        }
    },
    component: () => (
        <AppShell>
            <Outlet />
        </AppShell>
    )
})
