/* eslint-disable react-refresh/only-export-components */

import ClientsPage from '@/pages/ClientsPage'
import { Outlet, useRouterState, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/clients')({
    component: ClientsComponent,
});

function ClientsComponent() {
    const pathname = useRouterState({ select: (state) => state.location.pathname });

    if (pathname === '/clients') {
        return <ClientsPage />;
    }

    return <Outlet />;
}
