import OrdersPage from '@/pages/OrdersPage'
import { createFileRoute, useRouterState } from '@tanstack/react-router'
import { Outlet } from 'react-router-dom';

export const Route = createFileRoute('/_authenticated/orders')({
    component: RouteComponent,
})

function RouteComponent() {

    const pathname = useRouterState({ select: (state) => state.location.pathname });

    if (pathname === '/orders') {
        return <OrdersPage />;
    }
    return <Outlet />
}
