
import type { AuthContextType } from '@/contexts/AuthContext'
import NotFound from '@/pages/NotFound'
import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'


interface MyRouterContext {
    auth: AuthContextType
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => (
        <>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),

  notFoundComponent: () => (
    <NotFound />
  ),
})
