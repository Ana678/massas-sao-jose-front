import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '@/pages/LoginPage'
import { z } from 'zod';

export const Route = createFileRoute('/login')({
    beforeLoad: ({ context }) => {
        if (context.auth.isAuthenticated) {
            throw redirect({ to: '/' })
        }
    },
    validateSearch: z.object({
        redirect: z.string().optional(),
    }),
    component: LoginPage,
})
